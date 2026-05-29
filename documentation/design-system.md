# Design System — eSewa Match + Risk Escalation

> Goal: the **Stealth** baseline must look like the real eSewa app so judges/users instantly recognize it as trusted. The escalation (amber → red) then feels alarming *because* it breaks the familiar green calm. Color contrast against the trusted green is doing the psychological work.

---

## Brand Colors (Stealth baseline = normal eSewa)

| Token | Hex (approx) | Use |
|-------|--------------|-----|
| `--esewa-green` | `#60BB46` | Primary buttons, accents, active states |
| `--esewa-green-alt` | `#5FB246` | Hover/pressed green |
| `--esewa-green-dark` | `#1A5632` | Headers, dark accents, deep backgrounds |
| `--bg` | `#FFFFFF` | Page / card background |
| `--surface` | `#F5F7F5` | Input backgrounds, subtle panels |
| `--border` | `#E2E6E2` | Field borders, dividers |
| `--text` | `#1F2421` | Primary text |
| `--text-muted` | `#7A8579` | Labels, secondary text |

## Risk Tier Themes (the escalation)

| Tier | Theme | Key colors | Feel |
|------|-------|-----------|------|
| **Stealth** (0–30) | Normal eSewa | green `#60BB46` on white | Calm, trusted, zero alarm |
| **Caution** (31–60) | Amber | `#F5A623` accents, `#FFF8E1` banner bg, `#8A6D1A` text | Breaks the calm, "pay attention" |
| **Intervention** (61+) | Red / dark | `#D32F2F` accents, `#2A1212` / `#1A0E0E` dark bg, white text | Hijacks the familiar green, "STOP" |

> The jarring shift from trusted green → red is intentional. Users know "green eSewa = normal," so red registers as *wrong* instantly.

---

## UI Frame & Layout

This is a **React web app that looks like a phone** — NOT React Native, no responsiveness.

- **Fixed mobile width**, centered in the browser. One size only — design once, no breakpoints, no media queries.
- **Clean rounded card** (chosen over a realistic phone bezel): white card on a gray page background.
- Every screen is built to the **~410px width**.

```jsx
// App frame wrapper
<div className="min-h-screen bg-gray-100 flex items-center justify-center">
  <div className="w-[410px] min-h-[844px] bg-white rounded-3xl shadow-xl overflow-hidden">
    {/* all screens render here */}
  </div>
</div>
```

> Rationale: the product is conceived as the eSewa mobile app. A fixed phone-sized canvas reads as an app, looks clean on a projector, and cuts all responsive-design hours.

---

## Typography

- **Font:** Clean sans-serif. **Poppins** or **Inter** (free, close match to eSewa). Load via Google Fonts.
- **Headings:** semibold, dark green or `--text`.
- **Body:** regular, `--text`.
- **Labels:** small, `--text-muted`, slightly uppercase-ish for field labels.

---

## Components (match real eSewa)

- **Cards:** white bg, border-radius ~12px, soft shadow (`0 2px 8px rgba(0,0,0,0.06)`), generous padding/whitespace.
- **Buttons:** full-width, solid green, white text, rounded (~8px), bold label. (Intervention CTA turns red.)
- **Inputs:** light-gray bg (`--surface`), thin border (`--border`), green focus ring. Rounded.
- **Icons:** thin-stroke line icons in green. Use **Lucide** or **Tabler** icons (free) — they match eSewa's thin-line style. Shield icon for security, lock-phone for device warnings.

---

## Transaction Form — match real "Send Money" screen

Use eSewa's actual field labels so it reads as authentic:

| Field | Notes |
|-------|-------|
| **eSewa ID** | recipient (the payee) |
| **Amount** | with quick-pick chips: 50 / 100 / 500 / 1000 / 5000 (seen in Topup screen) |
| **Purpose** | dropdown (seen in Send Money screen) |
| **Remarks** | optional text |
| **Proceed** | full-width green button (NOT "Pay Now" — eSewa uses "Proceed") |

Plus the simulation toggles (kept visually separate / in a demo panel): active call, new device, unusual location.

Also seen in real UI (optional realism): a balance pill at top (`Rs. 2007.54 Balance`), "Recent" payee avatars row, transaction summary card (`Transaction Amt / eSewa Cashback / Total Paying Amt`).

---

## Quick Tailwind config snippet

```js
// tailwind.config.js — theme.extend.colors
// Every token below is referenced by the Consistency Rules + Core Components sections.
// Keep these names exact — components depend on them.
colors: {
  esewa: {
    green: '#60BB46',
    greenAlt: '#5FB246',
    dark: '#1A5632',
    surface: '#F5F7F5',   // input bg, subtle panels
    border: '#E2E6E2',    // field borders, dividers
    text: '#1F2421',      // primary text
    textMuted: '#7A8579', // labels, secondary text
  },
  caution: { accent: '#F5A623', bg: '#FFF8E1', text: '#8A6D1A' },
  danger:  { accent: '#D32F2F', bg: '#1A0E0E', surface: '#2A1212' },
}
```

---

## Consistency Rules (read before building any screen)

> Goal: **decent and consistent**, not pixel-perfect. The point of this section is that an AI building screen after screen reuses the *same* values instead of inventing new ones each time. When in doubt, pick the value here — don't improvise.

### Spacing (one rhythm everywhere)

Use a small fixed set. Don't reach for in-between values.

| Use | Tailwind |
|-----|----------|
| Screen side gutter (left/right padding inside the frame) | `px-5` |
| Card / panel padding | `p-5` (tight panels `p-4`) |
| Gap between form fields / stacked blocks | `gap-4` (via `space-y-4` or flex `gap-4`) |
| Gap between a label and its input | `gap-1.5` |
| Gap between small inline items (chips, icons) | `gap-2` |
| Section vertical breathing room | `mt-6` / `mb-6` |

### Type scale (fixed sizes)

| Element | Classes |
|---------|---------|
| Screen title (header) | `text-lg font-semibold` |
| Section heading | `text-base font-semibold` |
| Body text | `text-sm` |
| Field label | `text-xs text-esewa-textMuted` |
| Helper / caption | `text-xs text-esewa-textMuted` |
| OTP digit boxes | `text-2xl font-semibold` |
| Button label | `text-sm font-semibold` |

Font: Poppins (or Inter) as the default — set once in Tailwind, never per-component.

### Border radius (fixed)

| Element | Class |
|---------|-------|
| Phone frame | `rounded-3xl` |
| Cards / panels / banners | `rounded-xl` |
| Buttons, inputs, chips | `rounded-lg` |
| Avatars / circular icons | `rounded-full` |

### Elevation

One shadow only for raised surfaces: `shadow-sm` for cards, `shadow-xl` for the phone frame. Don't mix shadow sizes across cards.

---

## Core Components (build once, reuse everywhere)

> This is the most important anti-drift section. Build these as real components in `src/components/ui/` **before** building screens, then *always* reuse them. Never re-style a button or input inline on a screen — if it needs a variant, add a prop here.

**`<Button>`** — full-width by default, solid, bold, rounded.
- Base: `w-full rounded-lg text-sm font-semibold py-3 transition-colors`
- `variant="primary"` (default): `bg-esewa-green text-white hover:bg-esewa-greenAlt`
- `variant="danger"` (Intervention CTA): `bg-danger-accent text-white`
- `disabled`: `opacity-50 cursor-not-allowed` (used heavily — Caution/Intervention lock the CTA)

**`<Input>`** — light surface, thin border, green focus ring.
- `w-full rounded-lg bg-esewa-surface border border-esewa-border px-3 py-2.5 text-sm outline-none focus:border-esewa-green focus:ring-1 focus:ring-esewa-green`
- Always pair with a `<Label>` (the `text-xs text-esewa-textMuted` label above it).

**`<Card>`** — the standard white surface.
- `bg-white rounded-xl shadow-sm p-5`

**`<ScreenHeader>`** — the green top bar seen on Send Money / Topup.
- A green (`bg-esewa-green`) bar with white centered title (`text-lg font-semibold text-white`), optional back chevron left. Height ~`py-4`. Sits flush at the top of the frame.

**`<Banner>`** — the warning strip (this is what changes per tier, not the whole screen).
- Stealth: subtle, `bg-esewa-surface text-esewa-textMuted` — just the static line.
- Caution: `bg-caution-bg text-caution-text border-l-4 border-caution-accent`
- Intervention: `bg-danger-surface text-white border-l-4 border-danger-accent`
- Always `rounded-xl p-4 text-sm`.

**`<Chip>`** — the amount quick-picks (50/100/500/1000/5000).
- Unselected: `rounded-lg border border-esewa-border px-3 py-1.5 text-sm`
- Selected: `bg-esewa-green text-white border-esewa-green`

---

## Per-Tier Theming Rule (what actually changes color)

> Critical: escalation does **not** repaint the whole screen a flat color. The eSewa structure stays; specific elements change. This keeps it recognizable as eSewa even while alarming.

| Element | Stealth | Caution | Intervention |
|---------|---------|---------|--------------|
| Frame / page background | white | white | **dark** (`danger-bg`) — the takeover |
| Screen header bar | green | green | dark/red |
| **Warning banner** | subtle gray line | **amber** | **red on dark** |
| Proceed / submit button | green | green (locked until acknowledge) | **red** (locked until timer + checkboxes) |
| OTP input | visible, active | visible, locked until acknowledge | **hidden** until conditions met |
| Body text | dark on white | dark on white | **light on dark** |

**Rule of thumb:** in **Caution**, only the *banner* goes amber — the rest stays normal eSewa. In **Intervention**, the *whole frame* flips dark/red (this is the deliberate "the trusted green is gone" moment). Caution = accent change; Intervention = full takeover.

---

## One-line rationale for the pitch

> "We kept the Stealth screen pixel-faithful to eSewa on purpose — the trust users have in that green is exactly what we weaponize when the screen turns red."
