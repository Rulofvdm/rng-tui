# Components

`rng-tui` currently exposes two components:

- `tui-terminal`
- `tui-frame`

`tui-terminal` is the root layout surface, and `tui-frame` is the building block used inside it (and inside other frames).

## `tui-terminal` 

Root terminal surface that measures available space and assigns row/column sizes to direct child `tui-frame` elements.

### Inputs

- `layoutDirection: 'row' | 'column'` (default: `'row'`)
  - Controls how direct child frames are laid out.
  - `'row'` distributes children left-to-right.
  - `'column'` distributes children top-to-bottom.

## `tui-frame`

Frame container with optional borders, margins, and sizing rules (fixed or fill). Frames can be nested.

### Inputs

- `contentLayout: 'row' | 'column'` (default: `'column'`)
  - Layout direction for direct child frames inside this frame's content area.
- `width?: number`
  - Fixed width in terminal columns.
  - Mutually exclusive with `fillX`.
- `height?: number`
  - Fixed height in terminal rows.
  - Mutually exclusive with `fillY`.
- `fillX?: number`
  - Horizontal fill weight used when `width` is not set.
  - Higher values get a larger portion of remaining width.
  - Defaults to `1` when neither `fillX` nor `width` is provided.
- `fillY?: number`
  - Vertical fill weight used when `height` is not set.
  - Higher values get a larger portion of remaining height.
  - Defaults to `1` when neither `fillY` nor `height` is provided.
- `margins: number | { y?: number; top?: number; bottom?: number; x?: number; left?: number; right?: number }` (default: `0`)
  - Outer spacing around the frame.
  - Number form applies to all sides.
  - Object form supports axis shorthands (`x`, `y`) and per-side overrides.
- `hideBorders: boolean | { vertical?: boolean; horizontal?: boolean; left?: boolean; right?: boolean; top?: boolean; bottom?: boolean; all?: boolean }` (default: `false`)
  - Controls which border segments are hidden.
  - `true` or `{ all: true }` hides all borders.
  - Side-specific options override axis options.
- `borderHeader: string` (default: `''`)
  - Text drawn into the top border row between the corners.
  - Longer text is truncated to fit the available width.
  - If `hideBorders` hides the top side but `borderHeader` is non-empty, the top row still renders so the label remains visible.
- `borderFooter: string` (default: `''`)
  - Text drawn into the bottom border row between the corners.
  - Same truncation and visibility rules as `borderHeader`.
- `borderHeaderAlign: 'left' | 'center' | 'right'` (default: `'left'`)
  - Horizontal alignment of `borderHeader` within the top border run.
  - Remaining space is filled with the top horizontal border character (or spaces when the top border is hidden).
- `borderFooterAlign: 'left' | 'center' | 'right'` (default: `'left'`)
  - Horizontal alignment of `borderFooter` within the bottom border run.
  - Same padding behavior as `borderHeaderAlign`.
- `borderCharacters: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string; horizontal?: string; horizontalTop?: string; horizontalBottom?: string; vertical?: string; verticalLeft?: string; verticalRight?: string }`
  - Customizes border glyphs.
  - `horizontal` applies to both top and bottom if set.
  - `vertical` applies to both left and right if set.
  - Defaults use box-drawing characters.

