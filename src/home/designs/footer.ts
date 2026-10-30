export const FooterBleed = 80
export const CenterMinRadius = 200
export const CenterRadiusRatio = 0.8

export function getCenterRadius(w: number, h: number) {
  const centerRadius = Math.max(
    Math.min(w, h - FooterBleed) * 0.5 * CenterRadiusRatio,
    CenterMinRadius,
  )

  return centerRadius
}
