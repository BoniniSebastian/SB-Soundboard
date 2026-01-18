/* =========================
   SB SOUNDBOARD (iPhone/PWA)
   - Två kategorier
   - En låt åt gången
   - Tryck samma knapp igen = STOPP
   - MP3 väljs från mobilen
   - Minns val via localStorage
   ========================= */

let currentAudio = null;
let currentButton = null;
let currentId = null;

// Sparade ljud (DataURL) + namn
const savedSounds = JSON.parse(localStorage.getItem("sb-sounds") || "{}");

/* ---------- Bygg UI ---------- */
const app = document.createElement("div");
document.body.appendChild(app);

// KATEGORI 1 – MÅL (5 knappar)
createSection("MÅL", "goal", 5);

// KATEGORI 2 – MUSIK (18 knappar)
createSection("MUSIK", "music", 18);

/* ---------- Funktioner ---------- */

function createSection(title, type, count) {
  const section = document.createElement("div");
  section.className = "section";

  const h = document.createElement("div");
  h.className = "section-title";
  h.textContent = title;

  const grid = document.createElement("div");
  grid.className = "grid";

  for (let i = 0; i < count; i++) {
    const id = `${type}-${i}`;

    const btn = document.createElement("button");
    btn.className = `button ${type}`;
    btn.textContent = savedSounds[id]?.name || "+";

    btn.onclick = () => {
      // Om ingen fil kopplad → välj mp3
      if (!savedSounds[id]) {
        pickFile(id, btn);
        return;
      }

      // Om fil finns → spela/stoppa
      toggleSound(id, btn);
    };

    grid.appendChild(btn);
  }

  section.appendChild(h);
  section.appendChild(grid);
  app.appendChild(section);
}

function pickFile(id, btn) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";

  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      savedSounds[id] = {
        name: file.name.replace(/\.[^/.]+$/, ""), // filnamn utan .mp3
        data: reader.result // DataURL
      };

      localStorage.setItem("sb-sounds", JSON.stringify(savedSounds));
      btn.textContent = savedSounds[id].name;
    };

    reader.readAsDataURL(file);
  };

  input.click();
}

function toggleSound(id, btn) {
  // ✅ Tryck samma knapp igen → STOPP
  if (currentButton === btn) {
    stopCurrent();
    return;
  }

  // Annan knapp → stoppa förra och spela denna
  stopCurrent();

  const audio = new Audio(savedSounds[id].data);

  // iOS kan ibland kräva user gesture; klicket räcker här
  audio.play();

  currentAudio = audio;
  currentButton = btn;
  currentId = id;

  btn.classList.add("playing");

  audio.onended = () => {
    // Om den som avslutas fortfarande är "current"
    if (currentId === id) stopCurrent();
  };
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
  currentId = null;
}
