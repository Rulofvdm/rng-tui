import {
  AfterViewInit,
  Component,
  computed,
  ContentChildren,
  ElementRef,
  input,
  OnDestroy,
  QueryList,
  Signal,
  signal,
  viewChild,
} from '@angular/core'
import type { TuiFrameLayout } from './tui-frame-layout'
import { TuiLayoutRunner } from '../../tui-layout-runner'

export interface TuiBorderCharacters {
  topLeft?: string
  topRight?: string
  bottomLeft?: string
  bottomRight?: string
  horizontal?: string
  horizontalTop?: string
  horizontalBottom?: string
  vertical?: string
  verticalLeft?: string
  verticalRight?: string
}

const DEFAULT_BORDER_CHARACTERS: TuiBorderCharacters = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontalTop: '─',
  horizontalBottom: '─',
  verticalLeft: '│',
  verticalRight: '│',
}

export type TuiHideBorders = boolean | {
  vertical?: boolean
  horizontal?: boolean
  left?: boolean
  right?: boolean
  top?: boolean
  bottom?: boolean
  all?: boolean
}

/** Per-side/corner flags: `true` means hidden. */
export type TuiResolvedHideBorders = {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
  topLeft: boolean
  topRight: boolean
  bottomLeft: boolean
  bottomRight: boolean
}

export type TuiMargins = number | {
  y?: number
  top?: number
  bottom?: number
  x?: number
  right?: number
  left?: number
}

export type TuiResolvedMargins = {
  top: number
  right: number
  bottom: number
  left: number
}

const DEFAULT_MARGINS: TuiResolvedMargins = { top: 0, right: 0, bottom: 0, left: 0 }


const DEFAULT_FILL_WEIGHT = 1

@Component({
  selector: 'tui-frame',
  imports: [],
  templateUrl: './tui-frame.html',
  styleUrl: './tui-frame.css',
  host: {
    '[style.width]': 'hostWidth()',
    '[style.height]': 'hostHeight()',
    '[style.margin-left]': 'resolvedMargins().left',
    '[style.margin-right]': 'resolvedMargins().right',
    '[style.margin-top]': 'resolvedMargins().top',
    '[style.margin-bottom]': 'resolvedMargins().bottom',
  },

})
export class TuiFrame implements AfterViewInit, OnDestroy {
  hideBorders = input<TuiHideBorders>(false)

  /** How direct child {@link TuiFrame} elements in content are laid out. */
  contentLayout = input<'row' | 'column'>('column')

  private readonly contentEl = viewChild<ElementRef<HTMLElement>>('contentRef')

  @ContentChildren(TuiFrame, { descendants: false })
  private readonly childFrames!: QueryList<TuiFrame>

  private contentLayoutRunner?: TuiLayoutRunner
  borderCharacters = input(DEFAULT_BORDER_CHARACTERS, {
    transform: (value: TuiBorderCharacters) => this.mergeBorderCharacters(value),
  })

  private mergeBorderCharacters(value: TuiBorderCharacters): TuiBorderCharacters {
    const merged = { ...DEFAULT_BORDER_CHARACTERS, ...value }
    if (value.horizontal) {
      merged.horizontalTop = value.horizontal
      merged.horizontalBottom = value.horizontal
    }
    if (value.vertical) {
      merged.verticalLeft = value.vertical
      merged.verticalRight = value.vertical
    }
    return merged
  }

  margins = input<TuiMargins>(DEFAULT_MARGINS)

  readonly resolvedMargins = computed((): TuiResolvedMargins =>
    this.normalizeMargins(this.margins()),
  )

  private normalizeMargins(value: TuiMargins): TuiResolvedMargins {
    if (typeof value === 'number') {
      return { top: value, right: value, bottom: value, left: value }
    }
    return {
      top: value.top ?? value.y ?? 0,
      bottom: value.bottom ?? value.y ?? 0,
      left: value.left ?? value.x ?? 0,
      right: value.right ?? value.x ?? 0,
    }
  }

  /**
   * Flex grow weight along the x axis when no explicit {@link width} is set.
   * Mutually exclusive with `width`.
   */
  fillX = input<number>()

  /**
   * Flex grow weight along the y axis when no explicit {@link height} is set.
   * Mutually exclusive with `height`.
   */
  fillY = input<number>()

  /** Fixed column count. Mutually exclusive with `fillX`. */
  width = input<number>()

  /** Fixed row count. Mutually exclusive with `fillY`. */
  height = input<number>()

  /** Column count assigned by a parent layout host after flex distribution. */
  private readonly appliedWidth = signal<number | undefined>(undefined)
  /** Row count assigned by a parent layout host after flex distribution. */
  private readonly appliedHeight = signal<number | undefined>(undefined)

  /**
   * Flex weight when in fill mode; `undefined` when a fixed width is active.
   * Defaults to {@link DEFAULT_FILL_WEIGHT} when neither `fillX` nor `width` is bound.
   */
  readonly resolvedFillX = computed(() => {
    if (this.width() != null) {
      return undefined
    }
    return this.fillX() ?? DEFAULT_FILL_WEIGHT
  })

  readonly resolvedFillY = computed(() => {
    if (this.height() != null) {
      return undefined
    }
    return this.fillY() ?? DEFAULT_FILL_WEIGHT
  })

  /**
   * Snapshot of layout-related state for {@link TuiLayoutHost} and other library internals.
   *
   * @internal
   */
  readonly layout: Signal<TuiFrameLayout> = computed(() => {
    return {
      margins: this.resolvedMargins(),
      fillX: this.resolvedFillX(),
      fillY: this.resolvedFillY(),
      width: this.width(),
      height: this.height(),
    }
  })

  /**
   * Applies a size computed by a layout host (resolves a fill child).
   *
   * @internal
   */
  applySize(size: { width: number, height: number }): void {
    this.appliedWidth.set(size.width)
    this.appliedHeight.set(size.height)
    queueMicrotask(() => this.contentLayoutRunner?.recalculate())
  }

  ngAfterViewInit(): void {
    const content = this.contentEl()?.nativeElement
    if (!content || this.childFrames.length === 0) {
      return
    }
    this.contentLayoutRunner = new TuiLayoutRunner(
      () => content,
      () => this.contentLayout(),
      () => this.childFrames.toArray(),
    )
    this.contentLayoutRunner.attach()
    this.childFrames.changes.subscribe(() => this.contentLayoutRunner?.recalculate())
  }

  ngOnDestroy(): void {
    this.contentLayoutRunner?.detach()
  }

  readonly resolvedHideBorders = computed((): TuiResolvedHideBorders => {
    const hideBorders = this.hideBorders()
    if (hideBorders === true) {
      return this.allSidesHidden()
    }
    if (hideBorders === false) {
      return this.noSidesHidden()
    }
    if (hideBorders.all === true) {
      return this.allSidesHidden()
    }

    const hidden = {
      top: hideBorders.top ?? hideBorders.horizontal ?? false,
      right: hideBorders.right ?? hideBorders.vertical ?? false,
      bottom: hideBorders.bottom ?? hideBorders.horizontal ?? false,
      left: hideBorders.left ?? hideBorders.vertical ?? false,
    }
    return {
      ...hidden,
      topLeft: hidden.top || hidden.left,
      topRight: hidden.top || hidden.right,
      bottomLeft: hidden.bottom || hidden.left,
      bottomRight: hidden.bottom || hidden.right,
    }
  })

  readonly innerCols = computed(() => {
    const cols = this.appliedWidth()
    if (cols == null) {
      return null
    }
    const hidden = this.resolvedHideBorders()
    let inner = cols
    if (!hidden.left) {
      inner--
    }
    if (!hidden.right) {
      inner--
    }
    return Math.max(0, inner)
  })

  readonly innerRows = computed(() => {
    const rows = this.appliedHeight()
    if (rows == null) {
      return null
    }
    const hidden = this.resolvedHideBorders()
    let inner = rows
    if (!hidden.top) {
      inner--
    }
    if (!hidden.bottom) {
      inner--
    }
    return Math.max(0, inner)
  })

  readonly topEdgeRun = computed(() => this.horizontalEdgeRun('top'))
  readonly bottomEdgeRun = computed(() => this.horizontalEdgeRun('bottom'))

  readonly topEdgeRunWidthCh = computed(() => this.horizontalRunWidthCh('top'))
  readonly bottomEdgeRunWidthCh = computed(() => this.horizontalRunWidthCh('bottom'))

  /** One border glyph per inner row — aligned to 1lh cells (see template). */
  readonly leftEdgeLines = computed((): string[] =>
    this.edgeLinesPerInnerRow(this.borderCharacters().verticalLeft ?? '│'),
  )

  readonly rightEdgeLines = computed((): string[] =>
    this.edgeLinesPerInnerRow(this.borderCharacters().verticalRight ?? '│'),
  )

  private allSidesHidden(): TuiResolvedHideBorders {
    return {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topLeft: true,
      topRight: true,
      bottomLeft: true,
      bottomRight: true,
    }
  }

  private noSidesHidden(): TuiResolvedHideBorders {
    return {
      top: false,
      right: false,
      bottom: false,
      left: false,
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    }
  }

  cornerChar(side: 'top' | 'bottom', which: 'start' | 'end'): string {
    const chars = this.borderCharacters()
    if (side === 'top') {
      return which === 'start' ? (chars.topLeft ?? '╭') : (chars.topRight ?? '╮')
    }
    return which === 'start' ? (chars.bottomLeft ?? '╰') : (chars.bottomRight ?? '╯')
  }

  private horizontalRunColCount(side: 'top' | 'bottom'): number {
    const inner = this.innerCols()
    if (inner == null || inner <= 0) {
      return 0
    }
    const hidden = this.resolvedHideBorders()
    const startHidden = side === 'top' ? hidden.topLeft : hidden.bottomLeft
    const endHidden = side === 'top' ? hidden.topRight : hidden.bottomRight
    let runCols = inner
    if (startHidden) {
      runCols++
    }
    if (endHidden) {
      runCols++
    }
    return runCols
  }

  private horizontalRunWidthCh(side: 'top' | 'bottom'): string | null {
    const runCols = this.horizontalRunColCount(side)
    return runCols > 0 ? `${runCols}ch` : null
  }

  private horizontalEdgeRun(side: 'top' | 'bottom'): string {
    const runCols = this.horizontalRunColCount(side)
    if (runCols <= 0) {
      return ''
    }
    const chars = this.borderCharacters()
    const edgeChar =
      side === 'top'
        ? (chars.horizontalTop ?? '─')
        : (chars.horizontalBottom ?? '─')
    return edgeChar.repeat(runCols)
  }

  private edgeLinesPerInnerRow(char: string): string[] {
    const rows = this.innerRows()
    if (rows == null || rows <= 0) {
      return []
    }
    return Array.from({ length: rows }, () => char)
  }

  readonly hostWidth = computed(() => {
    const cols = this.appliedWidth()
    return cols != null ? `${cols}ch` : null
  })

  readonly hostHeight = computed(() => {
    const rows = this.appliedHeight()
    return rows != null ? `${rows}lh` : null  // or 1em per row if lh is unreliable
  })
}
