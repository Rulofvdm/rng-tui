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
- `borderContent: { top?: { left?: string; center?: string; right?: string }; bottom?: { left?: string; center?: string; right?: string } }` (default: `{}`)
  - Defines per-slot text for top and bottom border rows.
  - Supports rendering left, center, and right labels at the same time.
  - Overlap priority is `left > right > center` when slots compete for the same columns.
  - If a top/bottom border side is hidden but a slot contains text, that row still renders so the text remains visible.
  - Each non-empty slot is rendered as a `div` with a stable id for styling from the consuming app:
    - `#tui-border-top-left`, `#tui-border-top-center`, `#tui-border-top-right`
    - `#tui-border-bottom-left`, `#tui-border-bottom-center`, `#tui-border-bottom-right`
  - Slot ids are also exported as `TUI_BORDER_SLOT_IDS` from the package.
  - Style these ids from **global** CSS (e.g. `src/styles.css`) or with `:host ::ng-deep` in a parent component. Component-scoped styles (e.g. `app.css`) do not reach inside `tui-frame` because of Angular emulated encapsulation.
  - Empty slots are omitted from the DOM so they collapse; slot width and position still follow the same alignment and truncation rules as the composed border run.
  - When the frame is too narrow for all labels, slots shrink using the same overlap rules as the composed border run (`left` wins over `right` over `center`); fully covered slots disappear and partially covered slots show only their surviving characters.
- `borderCharacters: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string; horizontal?: string; horizontalTop?: string; horizontalBottom?: string; vertical?: string; verticalLeft?: string; verticalRight?: string }`
  - Customizes border glyphs.
  - `horizontal` applies to both top and bottom if set.
  - `vertical` applies to both left and right if set.
  - Defaults use box-drawing characters.

