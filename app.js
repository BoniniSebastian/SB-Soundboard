/* =========================
   SB SOUNDBOARD (AUTO från /sounds/)
   - Alla ljudfiler i /sounds/ blir knappar i MUSIK
   - En låt åt gången
   - Tryck samma knapp igen = STOPP
   - Ingen rename behövs
   ========================= */

let currentAudio = null;
let currentButton = null;

const OWNER = "boninisebastian";
const REPO = "SB-Soundboard";
const FOLDER = "sounds";

// GitHub API för att lista innehållet i /sounds/
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}`;

// Vilka filtyper vi tillåter
const AUDIO_EXT = ["mp3", "m4a", "wav", "ogg", "aac"];

init();

async function init() {
  // Bygg grund-UI
  const app = document.createElement("div");
  document.body.appendChild(app);

  const section = document.createElement("div");
  section.className = "section";

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "MUSIK";

  const grid = document.createElement("div");
  grid.className = "grid";

  section.appendChild(title);
  section.appendChild(grid);
  app.appendChild(section);

  // Ladda filer från GitHub
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`GitHub API fel: ${res.status}`);
    const files = await res.json();

    const audioFiles = (files || [])
      .filter((f) => f && f.type === "file" && isAudioFile(f.name))
      .map((f) => ({
        name: f.name,
        url: f.download_url // direktlänk till filen
      }));

    if (audioFiles.length === 0) {
      grid.innerHTML = `<div style="opacity:.7">Inga ljud hittades i <b>/sounds/</b>.</div>`;
      return;
    }

    // Skapa knappar
    audioFiles.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "button music";
      btn.textContent = prettyName(f.name);

      btn.onclick = () => toggleSound(btn, f.url);

      grid.appendChild(btn);
    });
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<div style="opacity:.7">
      Kunde inte läsa <b>/sounds/</b> via GitHub API.<br>
      Testa igen om 30 sek eller ladda om sidan.
    </div>`;
  }
}

function toggleSound(btn, url) {
  // Samma knapp igen = STOPP
  if (currentButton === btn) {
    stopCurrent();
    return;
  }

  // Byt ljud
  stopCurrent();

  const audio = new Audio(url);
  audio.preload = "auto";

  audio.play().catch((err) => {
    console.error(err);
    alert("Kunde inte spela ljudet. Testa igen.");
  });

  currentAudio = audio;
  currentButton = btn;
  btn.classList.add("playing");

  audio.onended = stopCurrent;
}

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (currentButton) {
    currentButton.classList.remove("playing");
  }
  currentAudio = null;
  currentButton = null;
}

function prettyName(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

function isAudioFile(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return AUDIO_EXT.includes(ext);
}
