function parseTextToRules(text) {
  const lower = text.toLowerCase();
  const words = lower
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const hasAny = (list) => list.some(w => words.includes(w));
  const hasPhrase = (phrase) => lower.includes(phrase);
  const hasAnyPhrase = (list) => list.some(p => lower.includes(p));

  return {
    frogs: words.filter(w => ["frog", "toad", "animal", "creature", "froggy"].some(k => w.includes(k))).length,
    frogSize: hasAnyPhrase(["tiny", "mini", "baby frog" ,"small"]) ? "small"
      : hasAnyPhrase(["big","large", "huge", "ginormous", "daddy frog", "mommy frog"]) ? "large"
      : "normal",
    ripples: words.filter(w => ["ripple", "disturb", "break", "move", "movement", "waves", "rings", "vibrate", "vibration", "circle"].some(k => w.includes(k))).length,
    pond: hasAny(["pond", "pool", "water", "surface", "body"]) || hasPhrase("body of water"),
    river: hasAny(["river", "stream", "canal"]),
    sea: hasAny(["sea", "ocean", "lake"]) || hasPhrase("large body of water"),
    moon: hasAny(["moon", "moonlight", "lunar"]),
    breeze: hasAny(["breeze", "wind", "gust", "air"]),
    reeds: hasAny(["reed", "reeds", "grass", "tallgrass", "cattail", "cattails"]),
    rocks: hasAny(["rock", "rocks", "stone", "stones", "pebble", "pebbles"]),
    lotus: hasAny(["lotus", "lily", "lilies", "waterlily", "water-lily", "flower", "blossom"]),
    cold: hasAny(["cold", "icy", "snow"]),
    night: words.includes("night"),
    sunset: hasAny(["dawn", "orange", "sunrise", "afternoon", "sunset"]),
  };
}
