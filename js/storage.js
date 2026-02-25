// Firebase Realtime Database storage

let archiveData = [];
let syncCallback = null;

// Set callback to update UI when data changes
function onArchiveSync(callback) {
  syncCallback = callback;
}

// Load archive from Firebase and listen for real-time updates
function loadArchive() {
  return new Promise((resolve) => {
    ARCHIVE_REF.on("value", (snapshot) => {
      const data = snapshot.val();
      archiveData = data ? Object.values(data) : [];
      
      // Sort by createdAt descending (newest first)
      archiveData.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      
      // Call sync callback if set (to update UI)
      if (syncCallback) {
        syncCallback();
      }
      
      resolve(archiveData);
    });
  });
}

function saveArchive(items) {
  // Clear and rebuild the entire archive
  ARCHIVE_REF.set(items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {}));
}

function addToArchive(entry) {
  ARCHIVE_REF.child(entry.id).set(entry)
    .catch(err => console.error("Firebase write failed:", err));
}

function clearArchive() {
  ARCHIVE_REF.remove()
    .catch(err => console.error("Firebase remove failed:", err));
}

function downloadJSON(filename, dataObj) {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function importArchiveFromJSONText(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("JSON must be an array of entries.");
  // Basic sanity filter:
  return parsed.filter(e => e && e.id && e.rules && typeof e.seed === "number");
}
