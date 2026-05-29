import {
  renderHorizontalFillMask,
  renderHorizontalRun,
  resolveHorizontalSlots,
} from './tui-frame-border'

describe('resolveHorizontalSlots', () => {
  it('matches renderHorizontalRun for combined output', () => {
    const slots = { left: 'L', center: 'C', right: 'R' }
    const runCols = 10
    const fill = '─'

    const run = renderHorizontalRun(runCols, fill, slots)
    const resolved = resolveHorizontalSlots(runCols, slots)

    expect(run).toBe('L───C────R')
    expect(resolved.left).toEqual({ text: 'L', startCol: 0, widthCols: 1 })
    expect(resolved.center).toEqual({ text: 'C', startCol: 4, widthCols: 1 })
    expect(resolved.right).toEqual({ text: 'R', startCol: 9, widthCols: 1 })
  })

  it('omits empty slots so they collapse', () => {
    expect(resolveHorizontalSlots(8, { center: 'HI' }).left).toBeUndefined()
    expect(resolveHorizontalSlots(8, { center: 'HI' }).center).toEqual({
      text: 'HI',
      startCol: 3,
      widthCols: 2,
    })
  })

  it('clamps long slot text to the run width', () => {
    expect(resolveHorizontalSlots(4, { left: 'HEADER_TOO_LONG' }).left).toEqual({
      text: 'HEAD',
      startCol: 0,
      widthCols: 4,
    })
  })

  it('truncates lower-priority slots when labels overlap on a narrow run', () => {
    const slots = {
      left: 'Hello',
      center: 'XX',
      right: 'End',
    }

    expect(renderHorizontalRun(10, '─', slots)).toBe('HelloX─End')
    expect(resolveHorizontalSlots(10, slots).left).toEqual({
      text: 'Hello',
      startCol: 0,
      widthCols: 5,
    })
    expect(resolveHorizontalSlots(10, slots).center).toEqual({
      text: 'X',
      startCol: 5,
      widthCols: 1,
    })
    expect(resolveHorizontalSlots(10, slots).right).toEqual({
      text: 'End',
      startCol: 7,
      widthCols: 3,
    })
  })

  it('keeps only the surviving tail of a right slot after left overlap', () => {
    const slots = { left: 'Hello', right: 'Hello' }

    expect(renderHorizontalRun(7, '─', slots)).toBe('Hellolo')
    expect(resolveHorizontalSlots(7, slots).right).toEqual({
      text: 'lo',
      startCol: 5,
      widthCols: 2,
    })
  })

  it('drops slots that are fully covered by higher-priority labels', () => {
    const slots = {
      left: '┤ Hello! ├',
      center: '┤ Hello! ├',
      right: '┤ Hi ├',
    }

    expect(resolveHorizontalSlots(6, slots).left).toEqual({
      text: '┤ Hell',
      startCol: 0,
      widthCols: 6,
    })
    expect(resolveHorizontalSlots(6, slots).center).toBeUndefined()
    expect(resolveHorizontalSlots(6, slots).right).toBeUndefined()
  })
})

describe('renderHorizontalFillMask', () => {
  it('leaves gaps under slot text so the rule does not strikethrough labels', () => {
    const slots = { left: 'L', center: 'C', right: 'R' }
    const runCols = 10
    const fill = '─'

    expect(renderHorizontalFillMask(runCols, fill, slots)).toBe(' ─── ──── ')
    expect(renderHorizontalRun(runCols, fill, slots)).toBe('L───C────R')
  })
})
