# Decider Matrix — Design System Prompt

## Design Brief for Claude Design Program

Redesign the Decider Matrix application as a **dark-mode-first, precision decision intelligence tool**. The aesthetic should feel like a premium productivity tool built for someone who takes their decisions seriously — think Linear's density and sharpness crossed with the analytical coldness of a Bloomberg terminal. No decoration for its own sake. Every pixel serves the workflow.

---

## Visual Identity

**Tone:** Calm authority. Clinical precision. Trust through restraint.

**Mood reference:** A forensic analyst's workstation. A cockpit. Something you'd use before making a €50,000 purchase or a career pivot.

### Color System

```
Background         #0A0A0F   — near-black, slightly blue-tinted
Surface 1          #111118   — cards, panels
Surface 2          #18181F   — elevated elements, modals
Surface 3          #22222C   — hover states, active rows

Border subtle      #2A2A38   — dividers, card outlines
Border strong      #3D3D52   — focused inputs, emphasis

Text primary       #F0F0F8   — headings, labels
Text secondary     #8A8AA8   — metadata, placeholders
Text muted         #4A4A62   — disabled, hints

Accent             #7B6EF6   — primary actions, highlights (violet-blue)
Accent bright      #9D93FF   — hover state for accent
Accent glow        rgba(123, 110, 246, 0.15) — glow on focus

Success            #3DD68C   — top-ranked result
Danger             #F06060   — delete actions
Warning            #F0B860   — validation errors

Score gradient     from #7B6EF6 to #3DD68C — score bars
```

### Typography

- **Display / Headings:** `JetBrains Mono` — gives the tool a terminal-precision feel, perfectly suited for a scoring instrument. Load from Google Fonts.
- **Body / Labels:** `Inter` — readable, neutral, modern. Load from Google Fonts.
- **Numbers / Scores:** `JetBrains Mono` with tabular numerals (`font-variant-numeric: tabular-nums`) so score columns align.

```
--font-mono: 'JetBrains Mono', monospace
--font-sans: 'Inter', system-ui, sans-serif

App title:         32px, font-mono, weight 700, letter-spacing -0.02em
Section headers:   13px, font-sans, weight 600, letter-spacing 0.08em, UPPERCASE, text-muted
Card titles:       15px, font-sans, weight 500
Body / inputs:     14px, font-sans, weight 400
Scores:            20px, font-mono, weight 600
Metadata:          12px, font-sans, text-secondary
```

---

## Layout System

### Grid

Full-viewport dark canvas. No hero banners. No page-wide gradients. The app lives in a **centered container** max 1280px wide, with 32px horizontal padding on desktop, 16px on mobile.

```
Top bar:           64px fixed, blur-backdrop glass strip
Main area:         padding-top: 80px (clears top bar)
Gutter between columns: 20px
Card padding:      20px
```

### Top Bar

A minimal fixed strip with:
- Left: `⬡ DECIDER` logotype in `font-mono`, accent color, 16px
- Center: the decision name as an **inline-editable text field** — clicking it activates an underline-style input. Placeholder: `"Untitled Decision"`. This replaces the current separate title card.
- Right: auth controls (Login / Register when logged out; avatar initial + username + Logout when logged in) — compact, text-only buttons in `text-secondary` that shift to `text-primary` on hover.

No shadows on the top bar. A 1px bottom border in `border-subtle` plus `backdrop-filter: blur(12px)` over `background: rgba(10,10,15,0.85)`.

### Main Layout (Editing Mode)

Three-column panel layout on desktop (≥1024px), single-column stack on mobile:

```
[  Criteria Panel  ] [  Items Panel  ] [  Results Panel  ]
     ~280px              ~400px            flex remaining
```

All three panels are **always visible simultaneously on desktop** — no tabs, no toggles. The result panel updates live as the user types. On mobile, collapse to tabs: Criteria → Items → Results.

---

## Component Design

### Panels (replace Bulma `.card`)

```css
.panel {
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 20px;
}

.panel:hover {
  border-color: var(--border-strong);
  transition: border-color 0.15s ease;
}
```

Each panel has:
- A section header label (e.g., `CRITERIA`, `OPTIONS`, `RESULTS`) — 13px, uppercase, `text-muted`, no icons
- A count badge next to the label: small pill `(3)` in `surface-3` background
- Content area
- A `+ Add` button anchored to the panel footer — full-width, dashed border, `text-secondary`, turns solid `accent` on hover

### Criterion Row

Replace the card-per-criterion with a **compact inline row**:

```
[ ─────── Criterion name input ──────── ] [ 00 ] [ × ]
```

- Name input: grows to fill available width, `background: transparent`, `border: none`, `border-bottom: 1px solid border-subtle`, focused: `border-bottom-color: accent`
- Importance: a small `36px × 36px` square numeric input, right-aligned, `background: surface-2`, rounded corners, `font-mono`. Value range 0–100, no label needed — the squareness implies it's a weight.
- Delete `×`: 24px ghost icon button, `text-muted` default, `danger` on hover
- Drag handle `⠿` as leftmost element — `text-muted`, shows on row hover only — for reordering criteria

No card borders between individual criteria. They're rows inside the panel, separated by a 1px `border-subtle` hairline.

### Item (Option) Block

Each item gets a slightly more spacious treatment since it contains multiple sub-values:

```
[ Item name ─────────────────────── ] [ × ]
  Criterion A     [ score input ]
  Criterion B     [ score input ]
  Criterion C     [ score input ]
```

- Name row: bold `font-sans` 14px, accent underline on focus
- Criterion value rows: 12px `text-secondary` criterion name left, small `48px` numeric input right
- The entire block uses `surface-1` background with `border: 1px solid border-subtle`, `border-radius: 8px`
- On hover: `border-color: border-strong`
- A subtle left-border `3px solid accent-glow` appears when an item holds the top score

### Results Panel

This is the hero of the application. Make it feel like a live leaderboard.

**Rank Rows** — not a `<table>`, but vertically stacked rank cards:

```
#1   [ ██████████████████████ ] 91.2%   Buy the MacBook
     Score: 8.4320

#2   [ █████████████          ] 67.4%   Upgrade RAM only
     Score: 6.2140

#3   [ ████                   ] 31.1%   Do nothing
     Score: 2.8830
```

- Rank number: `font-mono`, large (24px), `text-muted`
- Progress bar: full-width, height `6px`, `border-radius: 3px`; top item uses `score gradient`, others use `surface-3` with `accent` fill proportional to their score vs. top
- Percentage: `font-mono 14px`, `text-secondary`, right-aligned
- Option name: `font-sans 15px`, `text-primary`
- Raw score below the name: `font-mono 12px`, `text-muted`

Top item gets a `Success` accent treatment: rank number in `#3DD68C`, left border `3px solid success`.

**Animate** rank changes: when scores update (triggered by input), rows slide/fade to new positions using a 200ms ease-out transition. This makes the realtime feedback visceral.

---

## Interactive States

### Inputs

```
Default:   border-bottom 1px solid border-subtle
Focus:     border-bottom 2px solid accent, background tint: accent-glow
Error:     border-bottom 2px solid danger
```

No border-radius on text inputs. Use the underline style throughout — it's lighter and fits the density.

### Buttons

Two types only:

**Primary action** (Save, Export):
```
background: accent
color: #0A0A0F
border: none
border-radius: 6px
padding: 8px 16px
font-size: 13px
font-weight: 600
```

**Ghost action** (Import, Share, secondary):
```
background: transparent
color: text-secondary
border: 1px solid border-subtle
border-radius: 6px
padding: 8px 16px
font-size: 13px
```
On hover: `color: text-primary`, `border-color: border-strong`

**Destructive** (Logout, Delete):
```
color: danger
background: transparent
no border
```

No `.is-link`, no `.is-success`, no Bulma button variants. Replace them entirely.

### Empty States

When no criteria/items exist, show a centered empty state inside the panel:

```
   ○
   No criteria yet.
   [ + Add your first criterion ]
```

Icon: a simple outlined circle (not FontAwesome, draw it with CSS `border-radius: 50%` on a 24px div with `border: 2px solid border-strong`). Text in `text-muted`. The add button is the same dashed full-width button.

---

## Micro-interactions

- **Add row:** new rows slide in from the top with a 150ms `translateY(-8px) → 0` + `opacity 0 → 1`
- **Delete row:** rows collapse with a 120ms `max-height → 0` + `opacity → 0`
- **Score update:** result bar widths animate with `transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Rank change:** result rows rearrange with `transition: transform 200ms ease-out` via FLIP animation
- **Focus ring:** no browser default outline; replace with `box-shadow: 0 0 0 2px accent-glow` on focusable elements

---

## Auth UI

Replace the current page-level hero auth section with:

- Top-right corner of the top bar: `Login` and `Register` as small ghost buttons (13px)
- Login / Register pages: centered card on the dark canvas, 400px wide max, no hero wrapper, `surface-1` background card with `border: 1px solid border-subtle`, `border-radius: 12px`, 32px padding
- Fields: underline style
- Submit button: full-width primary button

The encryption toggle (encrypt with password) appears below the password field on login — a checkbox row: `[ ] Encrypt my matrices` — small, `text-secondary`, no explanation unless the user hovers (tooltip: `"Your data is encrypted client-side before upload. We never see your plaintext."`).

---

## Responsive Behavior

**≥1024px:** Three-column layout as described. All panels visible.

**768–1023px:** Criteria and Items stack vertically in a left column (50% width). Results take the right 50%.

**<768px:** Tab navigation at the top: `CRITERIA` | `OPTIONS` | `RESULTS`. Only the active panel renders. Results tab shows a badge with the top-ranked item name once scores are computed.

---

## What to Remove / Change from Current Design

- Remove the Bulma `.hero` / `.hero-body` wrapper — start the UI directly
- Remove `.card` with full card-header/card-content structure for each criterion — replace with compact rows
- Replace all `.button.is-link`, `.button.is-success` etc. with the two-type system above
- Remove FontAwesome dependency — use text symbols (`×`, `+`, `⠿`) and CSS shapes instead
- Replace the `slide` transition on the edit area toggle with the always-visible three-panel layout
- Remove the separate `DecisionTitle.svelte` card — move title to top bar inline editor

---

## Implementation Notes for Claude

When implementing this design in SvelteKit + Svelte:

1. Add a `<link>` in `src/app.html` for JetBrains Mono and Inter from Google Fonts
2. Define all CSS custom properties (the color/typography tokens above) in a `:root` block in `src/app.html`'s `<style>` tag or a global CSS file at `src/app.css` imported in `+layout.svelte`
3. Do not install any new npm packages — use pure CSS, no CSS framework replacement
4. Keep Bulma loaded for now but progressively override it; full Bulma removal is a separate pass
5. The FLIP rank animation in `DecisionResult.svelte` can be done with Svelte's `animate:flip` directive from `svelte/animate`
6. The inline-editable title in the top bar: bind it to the `decisionMatrix` store's `title` field using `contenteditable="plaintext-only"` on a `<span>`, which avoids a separate input element
7. All color values should reference CSS variables, never hardcoded hex — this makes a future light-mode theme trivial to add
