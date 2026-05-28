import { AfterContentInit, ContentChildren, Directive, ElementRef, inject, input, OnDestroy, QueryList, signal } from '@angular/core'
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
  private readonly el = inject(ElementRef<HTMLElement>)

  layoutDirection = input<'row' | 'column'>('row')
  width = signal<number>(0)
  height = signal<number>(0)

  @ContentChildren(TuiFrame, { descendants: false })
  childFrames!: QueryList<TuiFrame>

  private runner?: TuiLayoutRunner

  ngAfterContentInit(): void {
    this.runner = new TuiLayoutRunner(
      () => this.el.nativeElement,
      () => this.layoutDirection(),
      () => this.childFrames.toArray(),
    )
    this.runner.attach()
  }

  ngOnDestroy(): void {
    this.runner?.detach()
  }
}
