export type TuiHorizontalAlignment = 'left' | 'center' | 'right'

export interface TuiHorizontalSlots {
  left?: string
  center?: string
  right?: string
}

export function shouldRenderHorizontalRow(sideHidden: boolean, slots: TuiHorizontalSlots): boolean {
  return !sideHidden || hasSlotText(slots)
}

export function renderHorizontalRun(
  runCols: number,
  fillChar: string,
  slots: TuiHorizontalSlots,
): string {
  if (runCols <= 0) {
    return ''
  }
  if (!hasSlotText(slots)) {
    return fillChar.repeat(runCols)
  }

  const cells = Array.from({ length: runCols }, () => fillChar)

  // Priority by overwrite order: left > right > center.
  placeAlignedText(cells, slots.center, 'center')
  placeAlignedText(cells, slots.right, 'right')
  placeAlignedText(cells, slots.left, 'left')

  return cells.join('')
}

function hasSlotText(slots: TuiHorizontalSlots): boolean {
  return (slots.left?.length ?? 0) > 0
    || (slots.center?.length ?? 0) > 0
    || (slots.right?.length ?? 0) > 0
}

function placeAlignedText(
  cells: string[],
  text: string | undefined,
  align: TuiHorizontalAlignment,
): void {
  if (!text || text.length === 0) {
    return
  }
  const runCols = cells.length
  const clamped = text.slice(0, runCols)
  const labelLen = clamped.length
  if (labelLen === 0) {
    return
  }

  let start = 0
  if (align === 'right') {
    start = runCols - labelLen
  } else if (align === 'center') {
    start = Math.floor((runCols - labelLen) / 2)
  }

  for (let index = 0; index < labelLen; index++) {
    const cellIndex = start + index
    if (cellIndex < 0 || cellIndex >= runCols) {
      continue
    }
    cells[cellIndex] = clamped[index]
  }
}
