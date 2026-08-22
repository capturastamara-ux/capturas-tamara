export function getComparisonColumnLayout(planCount: number) {
  const labelWidthPx = 76;
  const planWidthPx =
    planCount <= 1 ? 260 : planCount === 2 ? 204 : 184;

  return {
    tableMinWidth: labelWidthPx + planWidthPx * Math.max(planCount, 1),
    labelWidthPx,
    planWidthPx,
  };
}
