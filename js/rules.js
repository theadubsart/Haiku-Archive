function parseTextToRules(text) {
  const lower = text.toLowerCase();
  const words = lower
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const hasAny = (list) => list.some((w) => words.includes(w));
  const hasPhrase = (phrase) => lower.includes(phrase);
  const hasAnyPhrase = (list) => list.some((p) => lower.includes(p));

  const frogKeywords = ["frog", "toad", "animal", "creature", "froggy"];
  const rippleKeywords = ["ripple", "disturb", "break", "move", "movement", "waves", "rings", "vibrate", "vibration", "circle"];
  const frogMentions = words.filter((w) => frogKeywords.some((k) => w.includes(k))).length;
  const explicitFrogCount = lower.match(/\b(\d+)\s+(?:frog|frogs|toad|toads)\b/);
  const hasPluralFrogWord = words.includes("frogs") || words.includes("toads");
  const hasMultipleFrogPhrase = hasAnyPhrase([
    "multiple frogs",
    "many frogs",
    "several frogs",
    "a few frogs",
    "couple of frogs",
    "group of frogs",
    "lots of frogs",
    "multiple toads",
    "many toads",
    "several toads",
  ]);

  let frogs = frogMentions;
  if (explicitFrogCount) {
    frogs = Number(explicitFrogCount[1]);
  } else if (frogMentions > 0 && hasMultipleFrogPhrase) {
    frogs = Math.max(frogMentions, 3);
  } else if (frogMentions > 0 && hasPluralFrogWord) {
    frogs = Math.max(frogMentions, 2);
  }

  return {
    frogs,
    frogSize: hasAnyPhrase(["tiny", "mini", "baby frog", "small"]) ? "small"
      : hasAnyPhrase(["big", "large", "huge", "ginormous", "daddy frog", "mommy frog"]) ? "large"
      : "normal",
    ripples: words.filter((w) => rippleKeywords.some((k) => w.includes(k))).length,
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
