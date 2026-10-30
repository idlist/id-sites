export const FooterBleed = 80

export function getCenterRadius(w: number, h: number) {
  const CenterRadiusRatio = 0.9
  const CenterMinRadius = 240

  const centerRadius = Math.max(
    CenterMinRadius,
    Math.min(w, h - FooterBleed) * 0.5 * CenterRadiusRatio,
  )

  return centerRadius
}
