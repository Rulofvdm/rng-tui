import type { TuiFrameLayout } from './components/tui-frame/tui-frame-layout'

export class LayoutEngine {
  constructor(private readonly cellSizeInPx: { ch: number; lh: number }) {}

  calculate(
    layoutDirection: 'row' | 'column',
    containerSize: { width: number; height: number },
    children: TuiFrameLayout[]
  ): { width: number; height: number }[] {

    const result: { width: number; height: number }[] = children.map(() => ({ width: 0, height: 0 }))
    const isRow = layoutDirection === 'row'

    let pixelsLeftToDistributeAlongMainAxis = isRow ? containerSize.width : containerSize.height
    let totaltMainAxisFill = 0
    // Calculate pixelsLeftToDistributeAlongMainAxis and assign main axis sizes if the child has an explicit size
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const mainAxisSizeInUnits: number = (isRow ? child.width : child.height) ?? 0
      const mainAxisSizeInPixels: number = this.unitToPixelSize(isRow ? 'ch' : 'lh', mainAxisSizeInUnits)
      const mainAxisMarginInUnits: number = (isRow ? child.margins.left + child.margins.right : child.margins.top + child.margins.bottom)
      const mainAxisMarginInPixels: number = this.unitToPixelSize(isRow ? 'ch' : 'lh', mainAxisMarginInUnits)
      
      pixelsLeftToDistributeAlongMainAxis = Math.max(0, pixelsLeftToDistributeAlongMainAxis - mainAxisSizeInPixels - mainAxisMarginInPixels)

      if (mainAxisSizeInUnits === 0) {
        totaltMainAxisFill += isRow ? (child.fillX ?? 0) : (child.fillY ?? 0)
      } else {
        if (isRow) {
          result[i].width = mainAxisSizeInUnits
        } else {
          result[i].height = mainAxisSizeInUnits
        }
      }
    }

    // Calculate main axis sizes for children that are in fill mode
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const mainAxisSizeInUnits: number = (isRow ? child.width : child.height) ?? 0
      if (mainAxisSizeInUnits === 0) {
        const childFillWeight = isRow ? (child.fillX ?? 0) : (child.fillY ?? 0)
        if (!childFillWeight) continue
        const axisUnitSizeInPixels = isRow ? this.cellSizeInPx.ch : this.cellSizeInPx.lh
        const mainAxisSizeInUnits = Math.floor((pixelsLeftToDistributeAlongMainAxis * (childFillWeight / totaltMainAxisFill)) / axisUnitSizeInPixels)
        if (isRow) {
          result[i].width = mainAxisSizeInUnits
        } else {
          result[i].height = mainAxisSizeInUnits
        }
        pixelsLeftToDistributeAlongMainAxis = Math.max(0, pixelsLeftToDistributeAlongMainAxis - (mainAxisSizeInUnits * axisUnitSizeInPixels))
        totaltMainAxisFill -= childFillWeight
      }
    }

    // Calculate cross axis sizes for children
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const crossAxisSizeInUnits: number = (isRow ? child.height : child.width) ?? 0
      if (crossAxisSizeInUnits !== 0) {
        if (isRow) {
          result[i].height = crossAxisSizeInUnits
        } else {
          result[i].width = crossAxisSizeInUnits
        }
      } else {
        const crossAxisChildMarginsInUnits: number = (isRow ? child.margins.top + child.margins.bottom : child.margins.left + child.margins.right)
        const crossAxisChildMarginsInPixels: number = this.unitToPixelSize(isRow ? 'lh' : 'ch', crossAxisChildMarginsInUnits)
        const parentCrossAxisPixelSizeAvailable = (isRow ? containerSize.height : containerSize.width) - crossAxisChildMarginsInPixels
        const crossAxisUnitSizeInPixels = isRow ? this.cellSizeInPx.lh : this.cellSizeInPx.ch
        const crossAxisSizeInUnits = Math.floor(parentCrossAxisPixelSizeAvailable / crossAxisUnitSizeInPixels)
        if (isRow) {
          result[i].height = crossAxisSizeInUnits
        } else {
          result[i].width = crossAxisSizeInUnits
        }
      }
    }
    return result
  }

  private unitToPixelSize(unit: 'ch' | 'lh', value: number): number {
    return unit === 'ch' ? value * this.cellSizeInPx.ch : value * this.cellSizeInPx.lh
  }
}
