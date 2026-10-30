export const FooterBleed = 80

export function getCenterRadius(w: number, h: number) {
  const CenterRadiusRatio = 0.8
  const CenterMinRadius = 200

  const centerRadius = Math.max(
    Math.min(w, h - FooterBleed) * 0.5 * CenterRadiusRatio,
    CenterMinRadius,
  )

  return centerRadius
}
