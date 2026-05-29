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
colors: {
  esewa: {
    green: '#60BB46',
    greenAlt: '#5FB246',
    dark: '#1A5632',
  },
  caution: { accent: '#F5A623', bg: '#FFF8E1', text: '#8A6D1A' },
  danger:  { accent: '#D32F2F', bg: '#1A0E0E', surface: '#2A1212' },
}
```

---

## One-line rationale for the pitch

> "We kept the Stealth screen pixel-faithful to eSewa on purpose — the trust users have in that green is exactly what we weaponize when the screen turns red."
