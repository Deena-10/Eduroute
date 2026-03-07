# Color combination code – EduRoute AI

All hex codes and Tailwind/CSS variables used in the app. Use these for consistency.

---

## Primary brand (buttons, links, active states)

| Name        | Hex       | Usage                          |
|------------|-----------|---------------------------------|
| Primary    | `#1C74D9` | Buttons, links, focus ring, nav  |
| Primary hover | `#0A3FAE` | Hover state for primary        |
| Primary alt | `#1557b0` | Some hover / secondary buttons |

**In code:** `bg-[#1C74D9]`, `hover:bg-[#0A3FAE]`, `text-[#1C74D9]`, `focus:ring-[#1C74D9]`, `border-[#1C74D9]`

---

## Design system (index.css + tailwind.config.js)

| Variable / Token | Hex       | Usage                |
|------------------|-----------|----------------------|
| `--primary-color` / `primary.DEFAULT` | `#667eea` | Old primary (some CSS) |
| `--primary-dark` / `primary.dark`      | `#5a6fd8` | Dark primary         |
| `--primary-light` / `primary.light`   | `#8b9ff8` | Light primary        |
| `--secondary-color` / `secondary.DEFAULT` | `#764ba2` | Secondary accent  |
| `--secondary-dark` / `secondary.dark` | `#6a4190` | Dark secondary       |
| `--secondary-light` / `secondary.light` | `#9b6bb8` | Light secondary   |

---

## Roadmap / game UI (Roadmap.jsx, progress, badges)

| Name     | Hex       | Usage                          |
|----------|-----------|---------------------------------|
| Purple   | `#A855F7` | Roadmap accent, progress start  |
| Pink     | `#EC4899` | Roadmap accent, progress end    |
| Emerald  | `#10B981` | Completed state, success bar    |
| Teal     | `#14B8A6` | Completed state end             |
| Gray bar | `#9CA3AF` | Locked progress start           |
| Gray bar | `#D1D5DB` | Locked progress end             |

---

## Neutrals (slate/gray)

| Token       | Hex       | Usage              |
|-------------|-----------|--------------------|
| Background  | `#F6F6F6` | Page bg (some pages) |
| Slate 50    | `#f8fafc` | `--gray-50`         |
| Slate 100   | `#f1f5f9` | `--gray-100`        |
| Slate 200   | `#e2e8f0` | Borders            |
| Slate 300   | `#cbd5e1` | Borders, inputs    |
| Slate 400   | `#94a3b8` | Placeholder        |
| Slate 500   | `#64748b` | Muted text         |
| Slate 600   | `#475569` | Body text          |
| Slate 700   | `#334155` | Headings           |
| Slate 800   | `#1e293b` | `--gray-800`       |
| Slate 900   | `#0f172a` | `--gray-900`       |

**In code:** `bg-slate-50`, `text-slate-700`, `border-slate-200`, `placeholder-slate-400`, etc.

---

## Semantic (index.css)

| Token    | Hex       | Usage          |
|----------|-----------|----------------|
| Success  | `#10b981` | Success state  |
| Warning  | `#f59e0b` | Warnings       |
| Error    | `#ef4444` | Errors         |
| Info     | `#3b82f6` | Info           |

---

## Home page gradients (Home.jsx)

| Name   | From     | To        |
|--------|----------|-----------|
| Gradient 1 | `#1C74D9` | `#0A3FAE` |
| Gradient 2 | `#00E5FF` | `#1C74D9` |
| Gradient 3 | `#00E5FF` | `#0A3FAE` |
| Gradient 4 | `#0F2F6B` | `#1C74D9` |

Background tints: `#1C74D9/30`, `#0A3FAE/30`, `#00E5FF/20`

---

## Google button (Login / Signup)

| Part   | Hex       |
|--------|-----------|
| Blue   | `#4285F4` |
| Green  | `#34A853` |
| Yellow | `#FBBC05` |
| Red    | `#EA4335` |

---

## Duolingo-style (index.css – game roadmap)

| Name   | Hex       |
|--------|-----------|
| Green  | `#58cc02` |
| Green dark | `#46a302` |

---

## Constellation / skill map (index.css)

| Name   | Hex / value        |
|--------|---------------------|
| Sky    | `#38bdf8`, `#0ea5e9` |
| Dark   | `#0f172a`, `#020617`, `#030712` |
| Cyan   | `#22d3ee`, `#0e7490` |

---

## Quick copy-paste (main palette)

```css
/* Primary (most used in UI) */
--brand-primary: #1C74D9;
--brand-primary-hover: #0A3FAE;
--brand-primary-alt: #1557b0;

/* Roadmap / progress */
--roadmap-purple: #A855F7;
--roadmap-pink: #EC4899;
--roadmap-done: #10B981;
--roadmap-done-end: #14B8A6;
--roadmap-locked: #9CA3AF;
--roadmap-locked-end: #D1D5DB;

/* Design system (legacy) */
--primary: #667eea;
--secondary: #764ba2;

/* Neutrals */
--bg-page: #F6F6F6;
--text-primary: #000000;
--text-muted: #64748b;
--border: #e2e8f0;
```

```js
// JavaScript/React constant
export const COLORS = {
  primary: '#1C74D9',
  primaryHover: '#0A3FAE',
  primaryAlt: '#1557b0',
  roadmapPurple: '#A855F7',
  roadmapPink: '#EC4899',
  success: '#10B981',
  successEnd: '#14B8A6',
  locked: '#9CA3AF',
  lockedEnd: '#D1D5DB',
  background: '#F6F6F6',
};
```

---

*Generated from current `frontend/src` usage. Update this file when you add or change colors.*
