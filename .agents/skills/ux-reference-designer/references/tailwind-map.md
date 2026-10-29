# CSS class -> Tailwind utility map

Use when the project is Tailwind-based. `max-w-6xl` = 72rem, `sm` = 640px, `lg` = 1024px. Prefer defining the tokens once (v4 `@theme`, v3 `theme.extend.colors`) instead of repeating `[#hex]`.

| CSS class (references/) | Tailwind utilities |
|---|---|
| `.app-bar` | `sticky top-0 z-40 bg-white border-b border-[#DADCE0]` |
| `.app-bar__row` | `h-16 px-6 flex items-center justify-between gap-4` |
| `.brand-name` | `text-[21px] font-bold tracking-tight text-[#202124] whitespace-nowrap` |
| `.app-bar__search` | `flex-1 min-w-0 max-w-xl mx-4 relative` |
| `.search` | `w-full bg-[#F1F3F4] text-[#202124] text-sm rounded-full pl-11 pr-4 py-2.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white placeholder-[#5F6368]` |
| `.tabs` / `.tabs__inner` | `bg-white border-b border-[#DADCE0] px-6` / `max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto` |
| `.tab` | `relative py-3.5 px-4 text-sm font-medium whitespace-nowrap text-[#5F6368] hover:text-[#202124]` |
| `.tab[aria-selected]` | `text-[#1A73E8] font-semibold` + child `absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A73E8] rounded-t-full` |
| `.page-header` | `max-w-6xl mx-auto px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4` |
| `.page-header__title` | `text-[28px] font-bold tracking-tight text-[#202124]` |
| `.content` / `.grid-12` | `max-w-6xl mx-auto px-6 pb-16` / `grid grid-cols-12 gap-6 items-start` |
| `.col-main` / `.col-side` | `col-span-12 lg:col-span-8` / `col-span-12 lg:col-span-4` |
| `.panel` | `bg-white rounded-2xl border border-[#DADCE0] overflow-hidden` |
| `.list` | `divide-y divide-[#E8EAED]` |
| `.item` | `p-6 hover:bg-[#F8F9FA]` (NOT `/60`: no alpha) |
| `.item__title` | `text-[19px] font-bold leading-snug tracking-tight text-[#202124] mb-3` |
| `.callout` | `bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3.5 mb-4` |
| `.chip--success` | `inline-flex items-center gap-1 text-[11px] font-medium text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] px-2 py-0.5 rounded-full` |
| `.chip--danger` | `... text-[#D93025] bg-[#FCE8E6] border border-[#FAD2CF] font-bold` |
| `.btn--primary` | `inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] whitespace-nowrap cursor-pointer` |
| `.btn--outline` | `... text-[#1A73E8] bg-white border border-[#DADCE0] hover:bg-[#F8F9FA]` |
| `.card` | `bg-white rounded-2xl border border-[#DADCE0] p-5` |
| `.icon-tile` | `p-1.5 rounded-lg` + `bg-[#FCE8E6] text-[#D93025]` (danger) |

## Do NOT use (breaks the solid-surface rule or the build)
- `backdrop-blur-*`, `bg-white/NN`, `bg-*/NN`, any `shadow-*` except a hard-edge custom one
- `shadow-2xs` (Tailwind v4 only), `py-0.2` (invalid), `no-scrollbar` (undefined unless you add the CSS from `layout.css`)
