import { LayoutEngine } from './layout-engine'
import type { TuiFrame } from './components/tui-frame/tui-frame'

/** Measures ch/lh and runs {@link LayoutEngine} for a set of child frames. */
export class TuiLayoutRunner {
  private unitSizesInPx?: { ch: number; lh: number }
  private engine?: LayoutEngine
  private observer?: ResizeObserver
  constructor(
    private readonly measureRoot: () => HTMLElement,
    private readonly getLayoutDirection: () => 'row' | 'column',
    private readonly getChildFrames: () => readonly TuiFrame[],
  ) {}

  attach(): void {
    this.unitSizesInPx = TuiLayoutRunner.measureUnitSizesInPx(this.measureRoot())
    this.engine = new LayoutEngine(this.unitSizesInPx)
    this.observer = new ResizeObserver(() => this.recalculate())
    this.observer.observe(this.measureRoot())
    this.recalculate()
  }

  detach(): void {
    this.observer?.disconnect()
    this.observer = undefined
  }

  recalculate(): void {
    const root = this.measureRoot()
    const children = this.getChildFrames()
    if (children.length === 0) {
      return
    }
    this.unitSizesInPx = TuiLayoutRunner.measureUnitSizesInPx(root)
    this.engine = new LayoutEngine(this.unitSizesInPx)
    const sizes = this.engine.calculate(
      this.getLayoutDirection(),
      { width: root.offsetWidth, height: root.offsetHeight },
      children.map((f) => f.layout()),
    )
    children.forEach((frame, i) => frame.applySize(sizes[i]!))
  }

  static measureUnitSizesInPx(el: HTMLElement): { ch: number; lh: number } {
    const probe = document.createElement('span')
    probe.style.cssText =
      'position:absolute;visibility:hidden;width:100ch;height:100lh;font:inherit;line-height:1;'
    el.appendChild(probe)
    const { width, height } = probe.getBoundingClientRect()
    probe.remove()
    return { ch: width / 100, lh: height / 100 }
  }
}
