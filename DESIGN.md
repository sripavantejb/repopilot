# Litigo — Design System

The source of truth for the Litigo visual language, taken from the landing page (`index.html`). Use this document when building new pages, the dashboard, the extension popup, or marketing assets so everything feels like one product.

> **Note:** `styles.css` (a dark, neon-green "CRT robot" theme using Host Grotesk / Bricolage Grotesk) is **legacy** and is **not** linked by `index.html`. Don't use it for new work.

---

## 1. Design Principles

| Principle | What it means in practice |
|---|---|
| **Calm & trustworthy** | Warm cream canvas, soft pastel surfaces, no harsh contrast except for primary CTAs. |
| **Editorial + product** | Serif display headlines (Playfair Display) paired with a clean sans UI font (Inter). |
| **Paper-craft illustration** | Hero uses layered "paper" clouds, halftone dots, and torn-paper mountains — soft, tactile, friendly. |
| **Rounded everything** | Pills for buttons and nav, 14–24px radii for cards. There are no sharp corners on interactive elements. |
| **Signal with color, sparingly** | Red = violation / low trust, Green = compliant / high trust. Pastels are only for decoration. |
| **Gentle motion** | 0.2s hover lifts (−1px to −2px), slow parallax clouds, eased progress bars. |

---

## 2. Typography

### 2.1 Font Families

| Role | Family | Fallback stack | Source |
|---|---|---|---|
| **Display / Headings** (`h1`–`h4`, `em`, big numbers) | **Playfair Display** | `Georgia, serif` | Google Fonts |
| **Body / UI** (paragraphs, nav, buttons, labels) | **Inter** | `-apple-system, BlinkMacSystemFont, sans-serif` | Google Fonts |
| **Code** (inline `code`) | System monospace | `monospace` | — |

**Google Fonts import (exact):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Loaded weights:
- **Playfair Display:** 400, 500, 600, 700 (roman) + 400, 500, 600 (italic)
- **Inter:** 400, 500, 600, 700 (the logo requests **900**, which the browser fakes with synthetic bold — add `900` to the import if you want a true Black weight)

### 2.2 Font Weights — Usage

| Weight | Name | Inter usage | Playfair usage |
|---|---|---|---|
| 400 | Regular | Body copy, paragraphs, footer | Italic emphasis (`em`) |
| 500 | Medium | Nav links, secondary CTA, sub-item labels, active tabs | **All headings `h1`–`h4` (default)** |
| 600 | SemiBold | Primary buttons, labels, badges, step numbers, `h4` in Inter | Stat numbers (`.ring-num`, privacy "0", card titles) |
| 700 | Bold | `<strong>` emphasis | Reserved (loaded, rarely used) |
| 900 | Black | **Wordmark "LITIGO" only** | — |

### 2.3 Type Scale

| Token / Element | Family | Size | Weight | Line-height | Letter-spacing | Notes |
|---|---|---|---|---|---|---|
| **Hero H1** | Playfair | `clamp(42px, 5.5vw, 70px)` | 500 | 1.18 | −0.01em | Key phrase wrapped in `<em>` (italic) |
| **CTA H2** (download) | Playfair | `clamp(36px, 4.5vw, 56px)` | 500 | 1.15 | −0.01em | |
| **Section title H2** | Playfair | `clamp(32px, 4vw, 48px)` | 500 | 1.2 | −0.01em | Centered |
| **Feature card H3** | Playfair | `clamp(28px, 3.5vw, 40px)` | 500 | 1.2 | −0.01em | |
| **Stat number XL** | Playfair | 48px | 600 | — | — | Privacy "0" counter |
| **Stat number L** | Playfair | 32px | 600 | 1 | — | Compliance ring % |
| **Card title** | Playfair | 22px | 600 | — | — | Startup v2 card |
| **Stat number S** | Playfair | 18px | 600 | — | — | Inline stats |
| **Wordmark (CTA)** | Inter | 48px | 900 | — | −0.04em | Each letter `skewX(-8deg)` |
| **Wordmark (nav)** | Inter | 22px | 900 | — | −0.04em | Each letter `skewX(-8deg)` |
| **Lead paragraph** | Inter | 17px | 400 | 1.6 | — | CTA section, color `--muted` |
| **Feature body** | Inter | 15px | 400 | 1.7 | — | max-width 380px, `--ink-soft` |
| **Button (large)** | Inter | 15px | 600 (primary) / 500 (secondary) | — | — | |
| **Install steps H4** | Inter | 16px | 600 | — | — | |
| **Nav link / Button (small)** | Inter | 14px | 500 / 600 | — | — | |
| **Capability H4** | Inter | 14px | 600 | — | — | |
| **Body small / step text** | Inter | 14px | 400 | 1.6 | — | |
| **Chat / rule text** | Inter | 13px | 400 | 1.5 | — | |
| **Capability caption** | Inter | 13px | 400 | 1.5 | — | `--muted` |
| **Footer bottom** | Inter | 13px | 400 | — | — | `#999` |
| **Eyebrow / feature label** | Inter | 12px | 600 | — | **0.1em** | UPPERCASE |
| **Pill tag / score** | Inter | 12px | 600 | — | — | |
| **Inline code** | monospace | 12px | 400 | — | — | |
| **Panel label** | Inter | 11px | 600 | — | 0.06em | UPPERCASE |
| **Tab label** | Inter | 11px | 400 / 500 active | — | — | |
| **Micro label** (ring "Trust") | Inter | 10px | 400 | — | 0.06em | UPPERCASE |
| **Badge** ("⚠ caught") | Inter | 10px | 600 | — | — | |

### 2.4 Typography Rules

- **Global body:** `line-height: 1.6`, `-webkit-font-smoothing: antialiased`.
- **Headings:** always Playfair Display at weight **500** with `letter-spacing: -0.01em`. Never bold headlines.
- **Italic accent:** use `<em>` inside a headline for the emotional or key phrase (e.g. *"AI rules"*, *"final rule."*, *"Always yours."*). `em` is always Playfair italic, even inside Inter text.
- **Eyebrows:** uppercase Inter 12px / 600 / `0.1em` tracking, color `--ink-soft`, 16px below.
- **Wordmark:** "LITIGO" is set letter by letter in `<span>`s, Inter 900, `-0.04em` tracking, each span `transform: skewX(-8deg)`. Always paired with `assets/logo.png` (32px in nav, 56px in CTA).
- **Never** use Inter for `h1`–`h3`. Inter `h4` is allowed for small UI headings (capabilities, install steps).

---

## 3. Color

### 3.1 Core Tokens (CSS variables)

```css
:root {
  --cream:       #FDF8F0; /* page background */
  --sky-light:   #C7E4F5; /* hero sky mid */
  --sky-medium:  #A8D4EC; /* hero sky top */
  --sky-deep:    #7CB8DE; /* reserved accent */
  --ink:         #1a1a1a; /* primary text, primary buttons */
  --ink-soft:    #333;    /* secondary text */
  --muted:       #666;    /* tertiary text, captions */
  --soft-blue:   #B4C7EF; /* feature card, step number */
  --soft-peach:  #FFE8D6; /* feature card */
  --soft-green:  #C8E6C9; /* feature card, toggles */
  --white:       #FFFFFF;
}
```

### 3.2 Neutrals

| Swatch | Hex | Usage |
|---|---|---|
| Cream | `#FDF8F0` | Page background (`body`) |
| White | `#FFFFFF` | Cards, windows, clouds, chat panels |
| Off-white warm | `#FAFAF8` | Mockup body background, rule items |
| Off-white chat | `#F8F8F5` | AI chat bubble |
| Gray 50 | `#F5F5F5` | Browser bar, inline `code` background |
| Gray 100 | `#F0F0F0` | Visual window header |
| Gray 150 | `#E8E8E8` | Active tab background |
| Gray 400 | `#999` | Footer copyright, faint captions |
| Gray 450 | `#888` | Mock URL text |
| Muted | `#666` | Captions, lead paragraph, inactive tabs |
| Gray 650 | `#444` | User chat bubble text |
| Ink soft | `#333` | Body copy on pastel cards, nav links |
| Ink | `#1a1a1a` | Headlines, primary buttons, icon strokes |
| Black | `#000` | Primary button **hover** only |

### 3.3 Pastel Surface Palette (feature cards)

| Name | Class | Hex | Used for |
|---|---|---|---|
| Soft Blue | `.feature-card.blue` | `#B4C7EF` | "Set & Forget" (rules) |
| Soft Peach | `.feature-card.peach` | `#FFE8D6` | "Trust & Verify" (scores) |
| Soft Green | `.feature-card.green` | `#C8E6C9` | "Privacy First" |
| Lavender | `.feature-card.purple` | `#E5DEFF` | "Beyond the Hackathon" (startup) |
| Amber | `.feature-card.amber` | `#FEF3C7` | "Launch Video" |

Rotate pastels so two adjacent sections never share a color.

### 3.4 Hero Illustration Palette

| Element | Hex |
|---|---|
| Sky gradient | `linear-gradient(180deg, #A8D4EC 0%, #C7E4F5 45%, #FDF8F0 100%)` |
| Clouds | `#FFFFFF` + halftone `rgba(0,0,0,0.05)` dots |
| Mountain 1 (periwinkle) | `#B8C5E8` |
| Mountain 2 (sand) | `#D4C5A8` |
| Mountain 3 (wheat) | `#F5DEB3` |

### 3.5 Semantic / Status Colors

| Meaning | Text / Fill | Background tint | Usage |
|---|---|---|---|
| **Danger / Violation / Low trust** | `#D64545` | `#FFF5F5`, `rgba(214,69,69,0.08)` (strikethrough), `rgba(214,69,69,0.12)` (badge) | "Without Litigo", violations, 34% score |
| **Success / Compliant (text)** | `#2E7D32` | `#E8F5E9` | "With Litigo" label, "highly reliable" |
| **Success (fill)** | `#4CAF50` | — | Progress bar fill, compliance ring |
| **Info (user bubble)** | `#444` | `#F0F4FF` | User chat message |

Trust thresholds: **≥ 80% → green**, **< 50% → red**. Keep any amber middle state in the amber family (`#FEF3C7` background).

### 3.6 Startup / v2 Accent Palette (purple)

| Hex | Usage |
|---|---|
| `#F3E8FF` | Header strip, "v2.0 Live" pill background |
| `#E9D5FF` | Active tab background |
| `#E0E7FF` | "Startup Platform" pill background |
| `#6B21A8` | Pill text |
| `#5B21B6` | Active tab text |
| `#3730A3` | Indigo pill text |
| `#4C1D95` | Body text on the v2 card |
| `#1E1B4B` | Title on the v2 card |

### 3.7 macOS Window Chrome

| Dot | Hex |
|---|---|
| Close | `#FF5F57` |
| Minimize | `#FEBC2E` |
| Zoom | `#28C840` |

### 3.8 Translucent Whites (on color)

| Value | Usage |
|---|---|
| `rgba(255,255,255,0.75)` | Feature button (default) |
| `rgba(255,255,255,0.88)` | Nav background (top of page) |
| `rgba(255,255,255,0.92)` | Hero button |
| `rgba(255,255,255,0.95)` | Nav (scrolled > 100px), feature button hover |

---

## 4. Borders

### 4.1 Border Widths & Colors

| Width | Color | Usage |
|---|---|---|
| **1px** | `rgba(0,0,0,0.04)` | Chat panels (lightest) |
| **1px** | `rgba(0,0,0,0.05)` | Install step row dividers |
| **1px** | `rgba(0,0,0,0.06)` | Nav pill, hero mockup, mockup bar bottom, footer top (**default hairline**) |
| **1px** | `rgba(0,0,0,0.10)` | Nav vertical divider (1×20px) |
| **1px** | `rgba(0,0,0,0.15)` | Secondary (outline) button |
| **8px** | `rgba(0,0,0,0.06)` track + `#4CAF50` / `#D64545` fill | Compliance ring |
| **none** | — | Buttons reset with `border: none` by default |

**Rule:** borders are always **1px**, black at **4–15% opacity**, never solid gray hex. The darker the opacity, the more interactive the element (0.06 = structure, 0.15 = clickable outline).

### 4.2 Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `radius-xs` | 2px | Progress bars (`.mini-bar`, `.mini-fill`) |
| `radius-sm` | 3–4px | Strikethrough highlight, badges, inline `code`, focus ring |
| `radius-md` | 6px | Tabs, mock URL field |
| `radius-lg` | 8px | Rule items, mini-score, v2 header strip |
| `radius-xl` | 10px | Chat bubbles |
| `radius-2xl` | 14px | Chat panels, visual windows |
| `radius-3xl` | 16px | Video iframe |
| `radius-4xl` | 20px | Hero mockup, install steps card |
| `radius-5xl` | 24px | Feature cards, video frame, hero sky bottom corners |
| `radius-pill` | 100px | Nav, all buttons, toggles, tags |
| `radius-full` | 50% | Window dots, step numbers, clouds, toggle knob, ring |

---

## 5. Shadows / Elevation

| Level | Value | Usage |
|---|---|---|
| **0 — Drop (illustration)** | `filter: drop-shadow(0 2px 8px rgba(0,0,0,0.04))` | Clouds |
| **1 — Subtle** | `0 1px 3px rgba(0,0,0,0.15)` | Toggle knob |
| **2 — Soft** | `0 2px 8px rgba(0,0,0,0.06)` | Feature button |
| **2b — Panel** | `0 2px 12px rgba(0,0,0,0.04)` | Chat panel |
| **3 — Raised** | `0 4px 16px rgba(0,0,0,0.08)` | Hero button |
| **3b — Floating nav** | `0 4px 24px rgba(0,0,0,0.08)` | Nav pill |
| **4 — Card** | `0 8px 32px rgba(0,0,0,0.06)` | Install steps |
| **4b — Hover** | `0 8px 24px rgba(0,0,0,0.12)` | Hero button hover |
| **5 — Window** | `0 16px 48px rgba(0,0,0,0.10)` | Visual windows |
| **5b — Video** | `0 20px 50px rgba(0,0,0,0.12)` | Video frame |
| **6 — Hero** | `0 24px 80px rgba(0,0,0,0.12)` | Hero product mockup |

Shadows are always **pure black at low opacity (4–15%)**, offset only on the Y axis, with large blur. No colored shadows.

---

## 6. Spacing & Layout

### 6.1 Spacing Scale (px)

`2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36 · 40 · 48 · 56 · 64 · 80 · 100 · 140`

| Use | Value |
|---|---|
| Icon ↔ label gap | 6–10px |
| Button padding (small) | `8px 18px` (nav), `10px 24px` (feature) |
| Button padding (large) | `14px 32px` |
| Pill tag padding | `6px 14px` |
| Chat bubble padding | `10px 14px` |
| Panel / window content padding | 18–28px |
| Install card padding | 36px |
| Feature card padding | **56px** desktop / 32px ≤1024px |
| Feature card grid gap | 48px (36px on video card) |
| Capability icon gap | 64px desktop / 32px ≤1024px |
| Section vertical padding | **100px** (capabilities, download), 60px (feature blocks) |
| Section horizontal padding | **48px** desktop / 24px ≤1024px |
| Hero padding | `140px 48px 80px` / `120px 24px 60px` mobile |
| Headline → button | 32px (hero), 20px (CTA h2) |
| Section title → content | 56px |

### 6.2 Containers

| Container | Max-width |
|---|---|
| Hero text | 720px |
| Hero mockup | 880px |
| Feature block | 1100px (centered) |
| Install steps | 700px |
| CTA paragraph | 480px |
| Feature paragraph | 380px |
| Capability item | 140px |
| Small visual window | 320px / offset 280px |

### 6.3 Grid

- **Feature card:** `grid-template-columns: 1fr 1fr`, content vertically centered. Alternate sides with `direction: rtl` on the card and `direction: ltr` on its children.
- **Video card:** `1fr 1.35fr`.
- **Feature sub-items:** 2-column grid, 20px gap.
- **Hero mockup body:** 2 columns (Without vs With), 24px gap.

### 6.4 Breakpoints

| Breakpoint | Changes |
|---|---|
| **≤ 1024px** | Nav links and divider hidden; nav `top: 12px`; all grids collapse to 1 column; feature card padding 32px; section padding-x 24px; offset window becomes static with `margin-top: -40px`; capability gap 32px. |

---

## 7. Components

### 7.1 Floating Pill Nav
- `position: fixed; top: 20px; left: 50%; transform: translateX(-50%)`, `z-index: 100`
- Background `rgba(255,255,255,0.88)` (0.95 after 100px scroll), `backdrop-filter: blur(20px)`
- Radius 100px, border 1px `rgba(0,0,0,0.06)`, shadow `0 4px 24px rgba(0,0,0,0.08)`
- Padding `10px 16px`, gap 16px
- Contents: Logo (32px) + wordmark, links (14px/500 `#333`, hover `#1a1a1a`), 1×20px divider, black pill CTA

### 7.2 Buttons

| Variant | Background | Text | Weight | Padding | Border | Hover |
|---|---|---|---|---|---|---|
| **Primary** (`.cta-primary`, `.nav-cta`) | `#1a1a1a` | `#fff` | 600 | 14×32 / 8×18 | none | bg `#000`, `translateY(-2px)` / `(-1px)` |
| **Secondary** (`.cta-secondary`) | transparent | `#1a1a1a` | 500 | 14×32 | 1px `rgba(0,0,0,0.15)` | bg `rgba(0,0,0,0.04)` |
| **Hero / Glass** (`.hero-btn`) | `rgba(255,255,255,0.92)` | `#1a1a1a` | 600 | 14×32 | none | `translateY(-2px)`, shadow → `0 8px 24px rgba(0,0,0,0.12)` |
| **On-pastel** (`.feature-btn`) | `rgba(255,255,255,0.75)` | `#1a1a1a` | 600 | 10×24 | none | bg 0.95, `translateY(-1px)` |

All buttons: radius **100px**, `transition: all 0.2s`, Inter font. External links get a trailing `↗` or `→`.

### 7.3 Feature Card
- Pastel background (§3.3), radius **24px**, padding **56px**, 2-col grid, `overflow: hidden`
- Order: Eyebrow (12px uppercase) → H3 with `<em>` → paragraph (15px/1.7) → `.feature-btn` → 2×2 sub-items (24px stroke icon + 14px/500 label)

### 7.4 Visual Window (product screenshot mock)
- White, radius 14px, shadow `0 16px 48px rgba(0,0,0,0.1)`
- Header: `#f0f0f0`, padding `10px 14px`, tabs (radius 6px, 11px; active `#e8e8e8` / 500)
- Content padding 20px

### 7.5 Hero Mockup (browser frame)
- White, radius 20px, 1px `rgba(0,0,0,0.06)` border, shadow `0 24px 80px rgba(0,0,0,0.12)`
- Bar `#f5f5f5` with traffic-light dots (10px) and a white URL pill (radius 6px, 12px `#888`)
- Body `#FAFAF8`, padding 28px

### 7.6 Chat Panel & Bubbles
- Panel: white, radius 14px, padding 18px, 1px `rgba(0,0,0,0.04)`, shadow `0 2px 12px rgba(0,0,0,0.04)`
- Label: 11px/600 uppercase `0.06em`, red `#D64545` or green `#2E7D32`, prefixed with `●`
- User bubble: `#F0F4FF` / `#444`, `margin-left: 20px`
- AI bubble: `#F8F8F5` / `#333`, `margin-right: 20px`; bad variant `#FFF5F5` / `#D64545`
- Bubble radius 10px, padding `10px 14px`, 13px / 1.5

### 7.7 Violation Highlight & Badge
- `.violation`: `line-through`, bg `rgba(214,69,69,0.08)`, padding `1px 3px`, radius 3px
- `.caught-badge`: bg `rgba(214,69,69,0.12)`, `#D64545`, 10px/600, padding `1px 6px`, radius 4px, text "⚠ caught"

### 7.8 Compliance Score (bar)
- Container: padding `8px 12px`, radius 8px, 12px/600
- Track: 4px tall, `rgba(0,0,0,0.06)`, radius 2px
- Fill: `#4CAF50` (good) / `#D64545` (bad), animated `width 1.5s ease-out` when scrolled into view

### 7.9 Compliance Ring
- 120×120, 8px border track `rgba(0,0,0,0.06)`
- Fill uses colored `border-top` / `border-right`, rotated
- Center: Playfair 32px/600 number + 10px uppercase `--muted` label

### 7.10 Toggle (static)
- 32×18 pill, `--soft-green` background
- 14px white knob, 2px inset, shadow `0 1px 3px rgba(0,0,0,0.15)`

### 7.11 Pill Tag
- Padding `6px 14px`, radius 100px, 12px/600, tinted background + darker same-hue text (e.g. `#F3E8FF` / `#6B21A8`)

### 7.12 Install Steps Card
- White, radius 20px, padding 36px, shadow `0 8px 32px rgba(0,0,0,0.06)`
- Rows: padding `14px 0`, divider 1px `rgba(0,0,0,0.05)` (none on the last row)
- Step number: 28px circle, `--soft-blue`, 13px/600 `--ink-soft`
- Inline code: `#f5f5f5`, padding `2px 6px`, radius 4px, 12px monospace

### 7.13 Footer
- Padding 48px, 1px `rgba(0,0,0,0.06)` top border, centered
- Links 14px `--muted` → hover `--ink`, 32px gap
- Bottom line 13px `#999`

---

## 8. Iconography

- **Style:** outline, Feather / Lucide-like, 24×24 viewBox
- **Stroke:** `var(--ink)` (`#1a1a1a`), **stroke-width 1.5**, `fill: none`, `stroke-linecap: round`, `stroke-linejoin: round`
- **Sizes:** 56px (capability icons), 24px (sub-item icons)
- Emoji are allowed **only** inside product mock tabs (🛡️, 🔒) and the "⚠" badge

---

## 9. Illustration (Hero)

1. **Sky panel:** inset 12px from the viewport edges, bottom corners 24px radius, vertical sky→cream gradient.
2. **Paper clouds:** white circles built from `::before` / `::after`, a soft drop shadow, and a halftone overlay (`radial-gradient` 1px dots on a 5px grid, 5% black, 50% opacity). Parallax on scroll at `0.05 + i × 0.02` speed.
3. **Torn-paper mountains:** three overlapping blobs with `border-radius: 45% 55% 0 0 / 100% 100% 0 0` in periwinkle, sand, and wheat, 220px tall area anchored to the bottom.
4. Content sits at `z-index: 2` above the mountains (`z-index: 1`).

---

## 10. Motion

| Interaction | Property | Duration / Easing |
|---|---|---|
| Link color hover | `color` | 0.2s |
| Button hover | `all` (lift −1px to −2px, bg, shadow) | 0.2s (default ease) |
| Score bar fill | `width` from 0 → value | 1.5s `ease-out`, 200ms delay, triggered at 40% visibility |
| Nav background on scroll | background opacity 0.88 → 0.95 | instant (JS) |
| Cloud parallax | `translateY` tied to scroll | continuous |
| Anchor links | smooth scroll | native `scroll-behavior: smooth` |

Keep motion subtle: no bounces, no lifts larger than 2px, and nothing that loops on the page except the parallax.

---

## 11. Accessibility & Misc

- Text contrast: `#1a1a1a` and `#333` on cream / pastels pass WCAG AA. Use `#666` only for secondary text at 13px or larger, and `#999` only for non-essential metadata.
- Never use red or green alone to communicate status. Always pair the color with a label ("Compliance: 34%", "⚠ caught", "highly reliable").
- Buttons are `cursor: pointer` and use `font-family: inherit`.
- Recommended focus style (bring it over from the legacy file, recolored): `outline: 2px solid #1a1a1a; outline-offset: 2px; border-radius: 4px;`
- Reset: `* { margin: 0; padding: 0; box-sizing: border-box; }`, links have no underline and inherit color.

---

## 12. Quick-Start Token Sheet

```css
:root {
  /* Fonts */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Colors */
  --cream: #FDF8F0;
  --white: #FFFFFF;
  --ink: #1a1a1a;
  --ink-soft: #333;
  --muted: #666;
  --faint: #999;
  --sky-light: #C7E4F5;
  --sky-medium: #A8D4EC;
  --sky-deep: #7CB8DE;
  --soft-blue: #B4C7EF;
  --soft-peach: #FFE8D6;
  --soft-green: #C8E6C9;
  --soft-purple: #E5DEFF;
  --soft-amber: #FEF3C7;
  --danger: #D64545;
  --danger-bg: #FFF5F5;
  --success: #2E7D32;
  --success-fill: #4CAF50;
  --success-bg: #E8F5E9;

  /* Borders */
  --border-faint: 1px solid rgba(0,0,0,0.04);
  --border-default: 1px solid rgba(0,0,0,0.06);
  --border-strong: 1px solid rgba(0,0,0,0.15);

  /* Radius */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 14px;
  --r-xl: 20px;
  --r-2xl: 24px;
  --r-pill: 100px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.10);
  --shadow-xl: 0 24px 80px rgba(0,0,0,0.12);

  /* Motion */
  --ease-fast: 0.2s;
}
```
