import {
  AfterContentInit,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnDestroy,
  QueryList,
  signal,
} from '@angular/core'
import { TuiLayoutRunner } from '../../tui-layout-runner'
import { TuiFrame } from '../tui-frame/tui-frame'

/**
 * Root terminal surface. Measures itself and assigns row/column sizes to child
 * {@link TuiFrame} elements via {@link LayoutEngine} (frames do not size themselves).
 */
@Component({
  selector: 'tui-terminal',
  imports: [],
  templateUrl: './tui-terminal.html',
  styleUrl: './tui-terminal.css',
  host: {
    '[style.display]': '"flex"',
    '[style.flex-direction]': 'layoutDirection()',
  },
})
export class TuiTerminal implements AfterContentInit, OnDestroy {
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
