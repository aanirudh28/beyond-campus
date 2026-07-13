// One hue per chapter: the screen ages with the player, dawn blue at 21
// through warm gold at 45. Used by the play page's ambient layer, chapter
// intros, and the montage. Display-only.
export const CHAPTER_HUES: { glow: string; accent: string }[] = [
  { glow: 'rgba(79, 124, 255, 0.16)', accent: '#7AB7FF' }, // 1 THE HUNT — dawn blue
  { glow: 'rgba(64, 156, 255, 0.15)', accent: '#5C9EFF' }, // 2 THE GRIND — electric blue
  { glow: 'rgba(123, 97, 255, 0.16)', accent: '#9B85FF' }, // 3 THE FORK — violet
  { glow: 'rgba(255, 182, 92, 0.13)', accent: '#FFB65C' }, // 4 THE WEIGHT — amber
  { glow: 'rgba(255, 107, 107, 0.13)', accent: '#FF8F8F' }, // 5 THE CORRECTION — ember
  { glow: 'rgba(255, 205, 130, 0.14)', accent: '#FFCD82' }, // 6 THE LEDGER — warm gold
]

export function chapterHue(index: number) {
  return CHAPTER_HUES[Math.max(0, Math.min(index, CHAPTER_HUES.length - 1))]
}
