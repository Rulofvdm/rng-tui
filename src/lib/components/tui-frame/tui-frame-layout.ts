import type { TuiResolvedMargins } from './tui-frame'

/** Layout snapshot read by {@link LayoutEngine} and {@link TuiLayoutHost}. */
export interface TuiFrameLayout {
  margins: Readonly<TuiResolvedMargins>
  fillX: number | undefined
  fillY: number | undefined
  width: number | undefined
  height: number | undefined
}
