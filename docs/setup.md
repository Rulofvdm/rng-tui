# Setup

This page describes the baseline setup needed for `rng-tui` to render as intended.

## Why setup matters

`rng-tui` computes layout in terminal-style cells (columns/rows). For borders and alignment to look right:

- use a monospace font
- ensure the layout chain fills the viewport (`html` -> `body` -> `app-root` -> `tui-terminal` -> `tui-frame`)

## Minimum CSS baseline

Add this to your global stylesheet (for example `src/styles.css`):

```css
html {
  font-family: monospace;
}

html,
body,
app-root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

app-root,
tui-terminal {
  display: block;
  width: 100%;
  height: 100%;
}
```

Then in the route/component where you render your terminal tree (for example `app.css`):

```css
tui-terminal,
tui-frame {
  width: 100%;
  height: 100%;
}
```

## Recommended extras

- Pick a specific monospace font for consistent glyph width.
- Set root foreground/background colors globally if you want a terminal-like theme.
- Ensure that any text you display in your template doesn't have margins or padding. Eg. 'p { margin: 0; }'. Unless you're a smartypants and know what you are doing
