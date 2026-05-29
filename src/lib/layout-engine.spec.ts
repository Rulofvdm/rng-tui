import { LayoutEngine } from './layout-engine'
import type { TuiFrameLayout } from './components/tui-frame/tui-frame-layout'

const fillChild = (overrides: Partial<TuiFrameLayout> = {}): TuiFrameLayout => ({
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  fillX: 1,
  fillY: 1,
  width: undefined,
  height: undefined,
  ...overrides,
})

describe('LayoutEngine', () => {
  it('floors fill width so assigned cols fit within the pixel budget', () => {
    const engine = new LayoutEngine({ ch: 8, lh: 16 })
    const [size] = engine.calculate('row', { width: 804, height: 480 }, [fillChild()])

    expect(size.width).toBe(100)
    expect(size.width * 8).toBeLessThanOrEqual(804)
  })

  it('floors cross-axis height the same way', () => {
    const engine = new LayoutEngine({ ch: 8, lh: 16 })
    const [size] = engine.calculate('row', { width: 800, height: 805 }, [fillChild()])

    expect(size.height).toBe(50)
    expect(size.height * 16).toBeLessThanOrEqual(805)
  })
})
