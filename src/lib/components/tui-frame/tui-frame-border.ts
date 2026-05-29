export type TuiHorizontalAlignment = 'left' | 'center' | 'right'

export type TuiHorizontalSlotName = keyof TuiHorizontalSlots

export interface TuiHorizontalSlots {
  left?: string
  center?: string
  right?: string
}

/** Stable element ids for styling border header/footer slots from consuming apps. */
export const TUI_BORDER_SLOT_IDS = {
  top: {
    left: 'tui-border-top-left',
    center: 'tui-border-top-center',
    right: 'tui-border-top-right',
  },
  bottom: {
    left: 'tui-border-bottom-left',
    center: 'tui-border-bottom-center',
    right: 'tui-border-bottom-right',
  },
} as const

export interface TuiResolvedHorizontalSlot {
  text: string
  startCol: number
  widthCols: number
}

export type TuiResolvedHorizontalSlots = Partial<
  Record<TuiHorizontalSlotName, TuiResolvedHorizontalSlot>
>

type SlotOwner = TuiHorizontalSlotName | null

interface HorizontalBorderRun {
  cells: string[]
  owners: SlotOwner[]
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

  return buildHorizontalBorderRun(runCols, fillChar, slots).cells.join('')
}

/**
 * Horizontal rule glyphs only in columns not covered by slot labels (same overlap as
 * {@link renderHorizontalRun}). Used behind styled slot divs so the line does not strikethrough text.
 */
export function renderHorizontalFillMask(
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

  const { owners } = buildHorizontalBorderRun(runCols, fillChar, slots)
  return owners.map((owner) => (owner ? ' ' : fillChar)).join('')
}

/**
 * Per-slot placement after overlap resolution (left > right > center), for styled header/footer divs.
 * Slots that lose columns to a higher-priority label are truncated or omitted.
 */
export function resolveHorizontalSlots(
  runCols: number,
  slots: TuiHorizontalSlots,
): TuiResolvedHorizontalSlots {
  if (runCols <= 0 || !hasSlotText(slots)) {
    return {}
  }

  const { cells, owners } = buildHorizontalBorderRun(runCols, ' ', slots)
  const resolved: TuiResolvedHorizontalSlots = {}
  const names: TuiHorizontalSlotName[] = ['left', 'center', 'right']
  for (const name of names) {
    const placement = extractOwnedSlot(cells, owners, name)
    if (placement) {
      resolved[name] = placement
    }
  }
  return resolved
}

function hasSlotText(slots: TuiHorizontalSlots): boolean {
  return (slots.left?.length ?? 0) > 0
    || (slots.center?.length ?? 0) > 0
    || (slots.right?.length ?? 0) > 0
}

function buildHorizontalBorderRun(
  runCols: number,
  fillChar: string,
  slots: TuiHorizontalSlots,
): HorizontalBorderRun {
  const cells = Array.from({ length: runCols }, () => fillChar)
  const owners = Array.from({ length: runCols }, () => null as SlotOwner)

  // Priority by overwrite order: left > right > center.
  assignSlotCells(cells, owners, slots.center, 'center')
  assignSlotCells(cells, owners, slots.right, 'right')
  assignSlotCells(cells, owners, slots.left, 'left')

  return { cells, owners }
}

function resolveSlotPlacement(
  runCols: number,
  text: string | undefined,
  align: TuiHorizontalAlignment,
): TuiResolvedHorizontalSlot | undefined {
  if (!text || text.length === 0) {
    return undefined
  }
  const clamped = text.slice(0, runCols)
  if (clamped.length === 0) {
    return undefined
  }

  let startCol = 0
  if (align === 'right') {
    startCol = runCols - clamped.length
  } else if (align === 'center') {
    startCol = Math.floor((runCols - clamped.length) / 2)
  }

  return { text: clamped, startCol, widthCols: clamped.length }
}

function assignSlotCells(
  cells: string[],
  owners: SlotOwner[],
  text: string | undefined,
  slot: TuiHorizontalSlotName,
): void {
  const placement = resolveSlotPlacement(cells.length, text, slot)
  if (!placement) {
    return
  }

  for (let index = 0; index < placement.text.length; index++) {
    const cellIndex = placement.startCol + index
    if (cellIndex < 0 || cellIndex >= cells.length) {
      continue
    }
    cells[cellIndex] = placement.text[index]
    owners[cellIndex] = slot
  }
}

function extractOwnedSlot(
  cells: string[],
  owners: SlotOwner[],
  slot: TuiHorizontalSlotName,
): TuiResolvedHorizontalSlot | undefined {
  let startCol = -1
  let endCol = -1

  for (let index = 0; index < owners.length; index++) {
    if (owners[index] !== slot) {
      continue
    }
    if (startCol < 0) {
      startCol = index
    }
    endCol = index
  }

  if (startCol < 0 || endCol < startCol) {
    return undefined
  }

  return {
    text: cells.slice(startCol, endCol + 1).join(''),
    startCol,
    widthCols: endCol - startCol + 1,
  }
}
