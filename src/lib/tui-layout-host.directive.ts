import { AfterContentInit, ContentChildren, Directive, ElementRef, input, OnDestroy, QueryList, signal } from '@angular/core'
import { TuiFrame } from './components/tui-frame/tui-frame'
import { TuiLayoutRunner } from './tui-layout-runner'

/**
 * Layout host for nested row/column {@link TuiFrame} groups (not the root terminal).
 * The root {@link TuiTerminal} assigns frame sizes itself; use this for inner layout regions.
 */
@Directive({
  host: {
    '[style.display]': '"flex"',
    '[style.flex-direction]': 'layoutDirection()',
  },
})
export abstract class TuiLayoutHost implements AfterContentInit, OnDestroy {
  layoutDirection = input<'row' | 'column'>('row')
  width = signal<number>(0)
  height = signal<number>(0)

  @ContentChildren(TuiFrame, { descendants: false })
  childFrames!: QueryList<TuiFrame>

  private runner?: TuiLayoutRunner

  constructor(protected readonly el: ElementRef<HTMLElement>) {}

  ngAfterContentInit(): void {
    this.runner = new TuiLayoutRunner(
      () => this.el.nativeElement,
      () => this.layoutDirection(),
      () => this.childFrames.toArray(),
    )
    this.runner.attach()
    this.childFrames.changes.subscribe(() => this.runner?.recalculate())
  }

  ngOnDestroy(): void {
    this.runner?.detach()
  }

  recalculate(): void {
    this.runner?.recalculate()
  }
}
