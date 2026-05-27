export type TuiHorizontalAlignment = 'left' | 'center' | 'right'

export function shouldRenderHorizontalRow(sideHidden: boolean, label: string): boolean {
  return !sideHidden || label.length > 0
}

export function renderHorizontalRun(
  runCols: number,
  fillChar: string,
  label: string,
  align: TuiHorizontalAlignment = 'left',
): string {
  if (runCols <= 0) {
    return ''
  }
  if (label.length === 0) {
    return fillChar.repeat(runCols)
  }
  const clampedLabel = label.slice(0, runCols)
  const padding = Math.max(0, runCols - clampedLabel.length)
  switch (align) {
    case 'right':
      return `${fillChar.repeat(padding)}${clampedLabel}`
    case 'center': {
      const leftPad = Math.floor(padding / 2)
      const rightPad = padding - leftPad
      return `${fillChar.repeat(leftPad)}${clampedLabel}${fillChar.repeat(rightPad)}`
    }
    case 'left':
    default:
      return `${clampedLabel}${fillChar.repeat(padding)}`
  }
}
