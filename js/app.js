function makeId() {
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

function clampWordCount(text, maxWords = 40) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function hashToSeed(str) {
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

function renderArchiveGrid(items) {
  const grid = document.getElementById("archiveGrid");
  grid.innerHTML = "";

  items.forEach((entry) => {
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

function getCombinedStep2Text() {
  const fields = [
    document.getElementById("aAnimals"),
    document.getElementById("aMovement"),
    document.getElementById("aAtmosphere"),
    document.getElementById("aElements"),
  ];

  return fields
    .map((field) => field.value.trim())
    .filter(Boolean)
    .join("\n");
}

function autoGrowTextarea(el) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function resetToStart() {
  showStep(1);
  const aAnimals = document.getElementById("aAnimals");
  const aMovement = document.getElementById("aMovement");
  const aAtmosphere = document.getElementById("aAtmosphere");
  const aElements = document.getElementById("aElements");
  const ageInput = document.getElementById("ageInput");
  const nationInput = document.getElementById("nationInput");
  const finalDescription = document.getElementById("finalDescription");
  const counter = document.getElementById("wordCounter");

  aAnimals.value = "";
  aMovement.value = "";
  aAtmosphere.value = "";
  aElements.value = "";
  [aAnimals, aMovement, aAtmosphere, aElements].forEach(autoGrowTextarea);
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
  const homeView = document.getElementById("homeView");
  const archiveView = document.getElementById("archiveView");
  const viewArchiveBtn = document.getElementById("viewArchiveBtn");
  const aboutProjectBtn = document.getElementById("aboutProjectBtn");

  function showArchiveView() {
    homeView.classList.add("hidden");
    archiveView.classList.remove("hidden");
    aboutProjectBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showHomeView() {
    closeModal();
    archiveView.classList.add("hidden");
    homeView.classList.remove("hidden");
    aboutProjectBtn.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  viewArchiveBtn.addEventListener("click", showArchiveView);
  aboutProjectBtn.addEventListener("click", showHomeView);

  mountP5("p5Mount");
  showStep(1);

  onArchiveSync((items) => {
    renderArchiveGrid(items);
  });
  loadArchive();

  const toStep2 = document.getElementById("toStep2");
  const backTo1 = document.getElementById("backTo1");
  const translateBtn = document.getElementById("translateBtn");
  const regenBtn = document.getElementById("regenBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelStep3 = document.getElementById("cancelStep3");

  const aAnimals = document.getElementById("aAnimals");
  const aMovement = document.getElementById("aMovement");
  const aAtmosphere = document.getElementById("aAtmosphere");
  const aElements = document.getElementById("aElements");
  const counter = document.getElementById("wordCounter");
  const finalDescription = document.getElementById("finalDescription");

  const ageInput = document.getElementById("ageInput");
  const nationInput = document.getElementById("nationInput");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");

  function updateCounter() {
    const wc = clampWordCount(getCombinedStep2Text(), 40);
    counter.textContent = `${wc}/40`;
    if (wc > 40) counter.textContent = `40/40`;
  }
  [aAnimals, aMovement, aAtmosphere, aElements].forEach((field) => {
    autoGrowTextarea(field);
    field.addEventListener("input", () => {
      autoGrowTextarea(field);
      updateCounter();
    });
  });
  updateCounter();

  toStep2.addEventListener("click", () => showStep(2));
  backTo1.addEventListener("click", () => showStep(1));

  let lastRules = null;
  let lastSeed = null;

  translateBtn.addEventListener("click", () => {
    const text = getCombinedStep2Text();
    finalDescription.value = text;

    const wc = clampWordCount(text, 40);
    if (wc > 40) {
      alert("Please keep your description to 40 words or fewer.");
      return;
    }

    lastRules = parseTextToRules(text);
    lastSeed = hashToSeed(text + "|" + Date.now());
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
});
