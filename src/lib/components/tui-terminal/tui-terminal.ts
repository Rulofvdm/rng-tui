import { Component } from '@angular/core'
import { TuiLayoutHost } from '../../tui-layout-host.directive'

/**
 * Root terminal surface. Measures itself and assigns row/column sizes to child
 * {@link TuiFrame} elements via {@link LayoutEngine} (frames do not size themselves).
 */
@Component({
  selector: 'tui-terminal',
  imports: [],
  templateUrl: './tui-terminal.html',
  styleUrl: './tui-terminal.css',
})
export class TuiTerminal extends TuiLayoutHost {}
