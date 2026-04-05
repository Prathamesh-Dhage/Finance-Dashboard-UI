# Ledger — Finance Dashboard

A clean, interactive personal finance dashboard built with **vanilla JavaScript, HTML, and CSS**. No frameworks, no build tools — just open `index.html` in a browser.

---

## 🚀 Quick Start

```bash
# Clone or extract the project
cd flux-dashboard

# Option 1: Open directly (works for most features)
open index.html

# Option 2: Serve locally (recommended, avoids any CORS quirks)
npx serve .
# or
python3 -m http.server 8080
# then open http://localhost:8080
```

No npm install. No bundler. No config.

---

## ✨ Features

### 1. Dashboard Overview
- **Three summary cards** — Net Balance, Total Income, Total Expenses with month-over-month deltas
- **Bar chart** — Income vs Expenses side-by-side for the last 6 months (hover for tooltips)
- **Donut chart** — Spending breakdown by category with inline % legend

### 2. Transactions Section
- Full table with **Date, Description, Category, Type, Amount**
- **Search** — filters by description or category name
- **Category dropdown** — filter to any single category
- **Type dropdown** — Income / Expense / All
- **Month dropdown** — filter to a specific month
- **Clear all** — resets all filters at once
- **Sortable columns** — click any header to sort ascending/descending (toggle)
- **CSV Export** — exports the current filtered view

### 3. Role-Based UI
Switch via the sidebar dropdown. Two roles:

| Feature        | Admin | Viewer |
|----------------|:-----:|:------:|
| View data      | ✅    | ✅     |
| Add transaction| ✅    | ❌     |
| Edit transaction| ✅   | ❌     |
| Delete transaction| ✅ | ❌     |

Role is persisted in `localStorage` across page refreshes.

### 4. Insights
Six auto-generated cards:
- **Top Spending Category** — with % of total
- **Month-over-Month Change** — with color-coded direction
- **Savings Rate** — vs the 20% benchmark
- **Avg Monthly Expenses** — across all recorded periods
- **Lowest Spend Category** — most controlled area
- **Total Transactions** — income vs expense split

Plus an animated **Category Breakdown** bar chart showing relative spend per category.

### 5. State Management
All state lives in a single `AppState` module (IIFE pattern, no framework) in `js/state.js`:

```
AppState = {
  transactions: [...],   // Persisted to localStorage
  role:         string,  // admin | viewer
  activeTab:    string,
  theme:        string,  // light | dark
  filters:      { search, category, type, month },
  sort:         { col, dir }
}
```

Subscribers are notified on state changes. Modules render from state, not from DOM scraping.

### 6. Optional Enhancements Included
- ✅ **Dark mode** — system-aware toggle button in topbar
- ✅ **LocalStorage persistence** — transactions, role, theme survive refresh
- ✅ **CSV export** — filtered transaction list
- ✅ **Animations** — staggered card reveals, bar chart grow, modal entrance
- ✅ **Form validation** — inline error messages on required fields
- ✅ **Responsive design** — collapsible sidebar on mobile, single-column layouts

---

## 📁 File Structure

```
flux-dashboard/
├── index.html               # Single HTML entry point
├── css/
│   ├── reset.css            # Box-model reset
│   ├── variables.css        # CSS custom properties + dark theme
│   ├── layout.css           # Sidebar, main, topbar, cards, panels
│   ├── components.css       # Buttons, table, modal, toast, filters
│   ├── charts.css           # Bar chart & donut chart styles
│   ├── responsive.css       # Breakpoint overrides
│   └── animations.css       # Keyframes & animation classes
└── js/
    ├── data.js              # Seed transactions + category config
    ├── state.js             # Centralized state module (AppState)
    ├── charts.js            # Bar chart, donut, summary card renderers
    ├── transactions.js      # Table render, filters, sort, CSV export
    ├── insights.js          # Insight cards + category breakdown
    ├── modal.js             # Add/edit transaction modal
    └── app.js               # Bootstrap, tab nav, role, theme wiring
```

---

## 🎨 Design Approach

**Aesthetic**: Editorial / refined. Warm cream background with deep moss-green accents — a considered, legible palette that doesn't feel like generic "dashboard blue".

**Typography**:
- `Playfair Display` — headings, figures, display text (serif character)
- `Instrument Sans` — body, labels, UI chrome (clean, geometric)
- `IBM Plex Mono` — numbers, dates, codes (monospace precision)

**Principles**:
- Information hierarchy is visible at a glance — big numbers, small labels
- Empty states handled gracefully on every view
- Admin-only UI elements are hidden (not disabled) for Viewers
- All data flows from `AppState` — no source-of-truth duplication

---

## 🧪 Edge Cases Handled

- Zero transactions → empty states on all charts
- All income / no expenses → donut chart hidden
- Viewer role → Add/Edit/Delete buttons removed from DOM
- Invalid form input → inline validation, submit blocked
- Filter with no results → table empty state
- Theme preference → survives page reload
- Role preference → survives page reload
