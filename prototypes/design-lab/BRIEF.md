# Prototype brief (shared by the three visual directions)

Throwaway visual prototype. Three directions (`a`, `b`, `c`) of the same product are built side by side so the owner can compare them and pick one. No backend: everything runs on mock data in memory.

## Product

A private web app for exactly two people, Danilo and Maellen (a couple), to track the games they played, are playing and want to play together. Part shared library, part two-person diary, part "what do we play tonight?" picker. Read `docs/product/01-product-brief.md` and `docs/product/02-mapa-da-experiencia.md` (repo root is `D:\projetos\jogos-em-dupla`) before designing — the second one defines navigation, page contents and their order.

**It will be used mostly on phones.** Design at 375px first; tablet (768) and desktop (1440) are adaptations, and desktop must still look intentional (use the width — no stretched phone column).

Anti-goals, in the owner's words: no generic SaaS dashboard, no walls of identical cards, no purposeless gradients, no indiscriminate glassmorphism, no heavy shadows, no animation everywhere, no stats on the home screen, no modal for things that can be done in place. It must feel like an entertainment product made for this couple, not a corporate app with a game theme.

## What already exists — use it, do not duplicate or modify it

- `src/data/games.ts` — mock data and helpers: `games` (27 in library), `catalog` (library + 8 not yet added), `sessions`, `people`, `taxonomy`, `taxonomyLabels`, `statusLabels`, `art(game, 'cover'|'hero'|'header')`, `getGame`, `jointAverage`, `ratingGap`, `isMatch`, `sessionsFor`, `searchCatalog`, `pickRandom`, `pairStats`, `formatRating`, `formatMinutes`, `formatDate`, `other`. Art files: cover = 600×900 portrait, hero = 1920×620 wide art without logo, header = 460×215 with logo.
- `src/lib/filters.ts` — `useLibraryFilters()` (state persisted in the URL query string), `applyFilters`, `activeChips`, `countActive`, `prefLabels`, `sortLabels`, `savedFilters`.
- `src/lib/viewer.tsx` — `useViewer()` → `{ viewer, partner, setViewer, greeting, greetingName }` (stands in for the signed-in user; Maellen is greeted by a rotating nickname) and `usePrefersReducedMotion()`.
- `src/lab/types.ts` — `DirectionMeta` type you must export.
- `src/index.css` — global reset only.
- Installed: react 19, react-router-dom 7, `motion` (import from `motion/react`). Do not install anything else. No Tailwind, no icon library: write plain CSS and draw the few icons you need as inline SVG.

If you believe a shared file has a bug, do not edit it — work around it and report it.

## What you own

Only `src/directions/<slug>/`. A stub `index.tsx` exists there; replace it. Required:

- `index.tsx` — default export: a component that renders `<div className="dir-<slug>">` with nested `<Routes>` (it is mounted at `/<slug>/*`).
- `meta.ts` — `export const meta: DirectionMeta` (type in `src/lab/types.ts`), filled with the real palette, fonts, signature and motion moments you built.
- One or more CSS files, **every selector scoped under `.dir-<slug>`**, tokens as CSS custom properties on `.dir-<slug>`. Load web fonts with `@import url(...)` at the top of your CSS (Google Fonts or Fontshare). Do not touch `index.html`.

Split into several component files; keep each under ~350 lines.

## Routes to build (relative to `/<slug>/`)

| Route | Screen | Must show |
|---|---|---|
| `` | Início | Greeting with `greeting`; the game being played now (continue); entry to the draw; "Nós dois queremos jogar" (`isMatch`); "Falta a sua nota" when the viewer has finished/played games without a review; last 3 sessions. The first phone screen must answer "O que vamos jogar hoje?" without scrolling. No stats block. |
| `biblioteca` | Biblioteca | Search (debounced), filter button with active count, sort, grid/list toggle (`ver=lista`), saved-filter shortcuts, active filter chips each removable, result count, clear-all, grid of covers and compact list, empty state that suggests which filter to remove. All of it driven by `useLibraryFilters()` so the URL is the state. |
| (inside biblioteca) | Filtros | Bottom sheet on phone, side panel on desktop. Groups in this order: Humor ou ocasião, Modo de jogo, Gênero, Características, Quem quer / situação (`prefs`), Nota mínima, Nossas tags. First two open, the rest collapsed (progressive disclosure). Multi-select chips, E/OU toggle (`logic`), live result count on the apply button ("Ver 6 jogos"), clear. Must not cover the whole screen on desktop. Focus is trapped while open, Escape closes, focus returns to the trigger. |
| `jogo/:id` | Detalhes | Cover/hero art, title, year, developer; the pair's status and each person's own status (three independent states — show them as such, editable in place); ratings: mine, partner's, joint average and gap — average and gap ONLY when both rated, otherwise an invitation to rate; an in-place rating editor (0–10 in 0.5 steps, comment, "recomendaria?", "jogaria de novo?") that works in memory; quick actions (quero jogar, registrar sessão, avaliar); tags; this game's sessions; about. Design something specific for strongly divergent ratings (see `jogo/cuphead`: 8.5 vs 3.5). Fast way back to where the user came from. |
| `adicionar` | Adicionar jogo | One screen, three moments, no stacked modals: search with cover results (`searchCatalog`, debounced; flag games already in the library and link to them instead of adding twice) → confirm imported metadata → optional status / "quero jogar" / tags → saved confirmation. Saving must work without touching the optional step. Include the "não achei — cadastrar manualmente" path and a no-results state. Suggest typing "cel", "out" or "it" in the placeholder/help so reviewers find results. |
| `sortear` | O que vamos jogar? | Starts from the matches; can be narrowed by mood/mode; draws one game (`pickRandom`), with "sortear de novo" and "é esse". This is where the direction's reveal animation lives. The result is decided before the animation starts, and a tap skips the animation. |
| `diario` | Diário | Timeline of `sessions` grouped by month. Simple but real. |
| `nos` | Nós | Who is viewing (switch between Danilo and Maellen with `setViewer`), numbers from `pairStats()`, most divergent games. Simple but real. |
| `estilo` | Paleta, tipografia e motion | The palette (swatches with name, hex, role), the type scale with real specimens, the core components in their states (buttons, chips, status tags, rating display, cover card incl. a missing-cover fallback and a very long title), and each motion moment replayable with a button. |

Navigation: bottom bar on phones (thumb reach, safe-area padding), top bar on desktop. Destinations: Início, Biblioteca, Diário, Nós, plus the "Adicionar jogo" action. Add a small, unobtrusive link back to `/design-lab` (the comparison page) in the direction's chrome, labelled "Comparar direções".

## Rules that are easy to get wrong

- All visible text in Brazilian Portuguese, sentence case, plain words. Code, comments and identifiers in English.
- Never show the joint average when only one person rated. Never assume both finished because one did.
- Nothing may depend on hover. Hover may add polish on desktop; touch gets `:active` feedback.
- Touch targets ≥ 44×44 px. Body text ≥ 16px on phones; inputs ≥ 16px (prevents iOS zoom).
- No horizontal page scroll at 375px (horizontal carousels inside a section are fine if they scroll-snap and have visible affordance).
- Visible keyboard focus on everything interactive; logical tab order; real `<button>`/`<a>`/`<label>`; images have `alt` (game title) or `alt=""` when decorative.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text), including text placed over artwork — put a scrim behind it.
- Respect `prefers-reduced-motion` (`usePrefersReducedMotion()`): replace movement with a fade or nothing. No looping/ambient animation, no auto-playing video, no animated backgrounds.
- Motion budget: ONE orchestrated signature moment (the draw reveal) plus motion that answers a user action (opening the filter sheet, cover → details, saving a rating, marking as finished). Do not add fade-up-on-scroll to sections or a hover transition to every card.
- Images: `loading="lazy"` below the fold, explicit `width`/`height` or `aspect-ratio` so nothing jumps. Handle a cover that fails to load.
- The two people must never be told apart by colour alone — pair colour with name or initial.
- Maellen's nicknames (Mahsterchef, Mahdame, Mahgnata, Mahnhosa, Mahmimada) may appear in greetings, empty states and small moments — sparingly, never as the label of a control.
- Do not invent game facts beyond what the mock data has. Mark nothing as "from Steam".

## Design process

1. Read your direction's design plan (in your task prompt). It was written after research (`docs/research/02-referencias-visuais.md`, `docs/research/03-motion.md` — read the section for your direction and the motion verdicts). The plan fixes palette, type and the signature; you own layout and everything else.
2. Read `D:\projetos\jogos-em-dupla\.claude\skills\impeccable\reference\craft-floor.md` right before writing UI, and `...\reference\critique-rubric.md` before your critique pass. Treat them as design guidance only; skip any step that asks you to run the `impeccable` launcher/binary — it is not installed.
3. Things that read as machine-made and are banned unless your plan explicitly asks for them: tracked-out all-caps eyebrow label above every heading; meta strings joined by middle dots everywhere; "→" appended to links; one word of a headline in italic or accent colour; identical rounded cards with the same soft grey shadow; gradient washes as decoration; numbered 01/02/03 markers on things that are not a sequence; emoji as icons.
4. Spend the boldness in one place (your signature). Keep the rest quiet and disciplined.
5. Verify by looking. The dev server is already running at `http://localhost:5173` (do not start another, do not kill it). From `D:\projetos\jogos-em-dupla\prototypes\design-lab` run, in PowerShell:
   `$env:PLAYWRIGHT_BROWSERS_PATH='D:\dev-cache\ms-playwright'; node scripts/screenshots.mjs <slug> mobile`
   (omit `mobile` for all three widths). Screenshots land in `D:\projetos\jogos-em-dupla\artifacts\screenshots\<slug>\`. The script also reports page errors and horizontal overflow. **Open the PNGs with the Read tool and critique them** — at minimum every mobile screen and the desktop home, library and details. Do at least two look-fix rounds; batch fixes between looks. For interactive states the script does not reach (open filter sheet, add-game results, draw reveal, rating editor) write your own small Playwright script in `D:\projetos\jogos-em-dupla\prototypes\design-lab\scripts\shots-<slug>.mjs` saving to `artifacts\screenshots\<slug>\` with names like `filtros-abertos-mobile.png`, `adicionar-resultados-mobile.png`, `sortear-resultado-mobile.png`, `avaliar-mobile.png`.
6. Typecheck with `npx tsc -b` from the prototype folder; fix every error in your folder (errors in other directions' folders belong to other people working in parallel — ignore them). TypeScript is strict with `verbatimModuleSyntax` (use `import type` / `type` modifiers) and `erasableSyntaxOnly` (no enums, no parameter properties).

Other people are building the other two directions in the same project at the same time. Stay inside your folder, your `scripts/shots-<slug>.mjs` and your screenshots folder.

## Final report (keep it under 300 words)

What you built per route; the signature moment and where to see it; anything required that is missing or only partly working (say so plainly); bugs found in shared files; the list of screenshot files you produced.
