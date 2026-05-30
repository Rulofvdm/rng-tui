import { AfterContentInit, ContentChildren, DestroyRef, Directive, ElementRef, inject, input, OnDestroy, QueryList, signal } from '@angular/core'
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
  private readonly destroyRef = inject(DestroyRef)
  private readonly el = inject(ElementRef<HTMLElement>)

  layoutDirection = input<'row' | 'column'>('row')
  width = signal<number>(0)
  height = signal<number>(0)

  @ContentChildren(TuiFrame, { descendants: false })
  childFrames!: QueryList<TuiFrame>

  private runner?: TuiLayoutRunner

  ngAfterContentInit(): void {
    this.syncLayoutRunner()
    const sub = this.childFrames.changes.subscribe(() => {
      queueMicrotask(() => this.syncLayoutRunner())
    })
    this.destroyRef.onDestroy(() => sub.unsubscribe())
  }

  ngOnDestroy(): void {
    this.runner?.detach()
  }

  private syncLayoutRunner(): void {
    if (this.childFrames.length === 0) {
      this.runner?.detach()
      this.runner = undefined
      return
    }

    if (!this.runner) {
      this.runner = new TuiLayoutRunner(
        () => this.el.nativeElement,
        () => this.layoutDirection(),
        () => this.childFrames.toArray(),
      )
      this.runner.attach()
      return
    }

    this.runner.recalculate()
  }
}
