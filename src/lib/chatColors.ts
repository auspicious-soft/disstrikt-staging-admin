// Sender-name colours for chat bubbles: bright enough to read on the dark
// bubble (#332D2F), and each person always gets the same one.
const NAME_COLORS = [
  "#FF7AA2", // pink
  "#5CC8FF", // sky
  "#7CE38B", // green
  "#FFC857", // amber
  "#B69CFF", // violet
  "#FF8A65", // coral
  "#4DD9D0", // teal
  "#F28CFF", // orchid
  "#A8E05F", // lime
  "#FFA94D", // orange
];

/** Stable colour for a sender (pass their id, or their name if there's no id). */
export const nameColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
};
