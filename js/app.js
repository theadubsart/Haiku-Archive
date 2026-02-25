function makeId() {
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

function clampWordCount(text, maxWords = 40) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function hashToSeed(str) {
  // small deterministic hash -> uint32
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function showStep(n) {
  document.getElementById("step1").classList.toggle("hidden", n !== 1);
  document.getElementById("step2").classList.toggle("hidden", n !== 2);
  document.getElementById("step3").classList.toggle("hidden", n !== 3);
}

function renderArchiveGrid() {
  const grid = document.getElementById("archiveGrid");

  grid.innerHTML = "";

  // archiveData is always an array
  archiveData.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "archive-card";
    card.title = "Open";

    const inner = document.createElement("div");
    card.appendChild(inner);

    renderStaticThumbnail(inner, entry.rules, entry.seed, 240);

    card.addEventListener("click", () => openModal(entry));
    grid.appendChild(card);
  });
}

function resetToStart() {
  showStep(1);
  const descInput = document.getElementById("descriptionInput");
  const ageInput = document.getElementById("ageInput");
  const nationInput = document.getElementById("nationInput");
  const finalDescription = document.getElementById("finalDescription");
  const counter = document.getElementById("wordCounter");

  descInput.value = "";
  ageInput.value = "";
  nationInput.value = "";
  finalDescription.value = "";
  counter.textContent = "0/40";
}

function openModal(entry) {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  document.getElementById("modalAge").textContent = String(entry.age || "");
  document.getElementById("modalNation").textContent = String(entry.nationality || "");
  document.getElementById("modalDesc").textContent = String(entry.description || "");

  const visual = document.getElementById("modalVisual");
  renderStaticThumbnail(visual, entry.rules, entry.seed, 380);
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  // mount main p5 canvas
  mountP5("p5Mount");

  const toStep2 = document.getElementById("toStep2");
  const backTo1 = document.getElementById("backTo1");
  const translateBtn = document.getElementById("translateBtn");
  const regenBtn = document.getElementById("regenBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelStep3 = document.getElementById("cancelStep3");

  const descInput = document.getElementById("descriptionInput");
  const counter = document.getElementById("wordCounter");
  const finalDescription = document.getElementById("finalDescription");

  const ageInput = document.getElementById("ageInput");
  const nationInput = document.getElementById("nationInput");

  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  const clearBtn = document.getElementById("clearBtn");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");

showStep(1);

onArchiveSync(() => {
  renderArchiveGrid();
});

loadArchive(); 

  // word counter (40 words)
  function updateCounter() {
    const wc = clampWordCount(descInput.value, 40);
    counter.textContent = `${wc}/40`;
    if (wc > 40) counter.textContent = `40/40`;
  }
  descInput.addEventListener("input", updateCounter);
  updateCounter();

  toStep2.addEventListener("click", () => showStep(2));
  backTo1.addEventListener("click", () => showStep(1));

  let lastRules = null;
  let lastSeed = null;

  translateBtn.addEventListener("click", () => {
    const text = descInput.value.trim();
    finalDescription.value = text;

    // You can enforce 40 word max if you want:
    const wc = clampWordCount(text, 40);
    if (wc > 40) {
      alert("Please keep your description to 40 words or fewer.");
      return;
    }

    lastRules = parseTextToRules(text);
    lastSeed = hashToSeed(text + "|" + Date.now()); // new each translate (or remove Date.now to keep stable)
    setCurrentRender(lastRules, lastSeed);

    showStep(3);
  });

  regenBtn.addEventListener("click", () => {
    if (!lastRules) return;
    lastSeed = hashToSeed(finalDescription.value + "|" + Date.now());
    setCurrentRender(lastRules, lastSeed);
  });

  saveBtn.addEventListener("click", () => {
    if (!lastRules || lastSeed === null) {
      alert("Translate your description first.");
      return;
    }

    const entry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      age: ageInput.value.trim(),
      nationality: nationInput.value.trim(),
      description: finalDescription.value.trim(),
      rules: lastRules,
      seed: lastSeed,
    };

    addToArchive(entry);

    // reset to start (optional)
    resetToStart();
    updateCounter();
  });

  cancelStep3.addEventListener("click", () => {
    resetToStart();
    updateCounter();
  });

  // Modal
  modalBackdrop.addEventListener("click", closeModal);
  modalClose.addEventListener("click", closeModal);

  // Export / Import / Clear
exportBtn.addEventListener("click", () => {
  downloadJSON("archive.json", archiveData);
});

  importFile.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const imported = importArchiveFromJSONText(text);
      saveArchive(imported);
      alert("Imported archive.");
    } catch (err) {
      alert("Import failed: " + err.message);
    } finally {
      importFile.value = "";
    }
  });

  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear the local archive on this browser?")) return;
    clearArchive();
    renderArchiveGrid();
  });
});
