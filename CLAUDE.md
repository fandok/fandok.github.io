# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # tsc type-check + Vite production build
npm run lint       # ESLint
npm run preview    # preview production build locally
```

No test suite configured.

## Architecture

**Stack:** React 19 + TypeScript + Vite + React Router v7. Deployed as a static GitHub Pages site.

**Build pipeline quirk:** Vite uses OXC for JSX transforms (`@vitejs/plugin-react`), with a separate Babel pass (`@rolldown/plugin-babel`) to run the React Compiler. Both must stay in `vite.config.ts`.

**Routing:** `BrowserRouter` wraps everything in `main.tsx`. Routes are declared flat in `App.tsx`. Each route maps to a page component.

**Page structure:**
- `src/pages/` — top-level pages (`Home`, `NotFound`)
- `src/pages/features/<name>/` — self-contained feature pages (each in their own folder)
- CSS Modules (`.module.css`) for scoped styles on pages; inline styles for feature components

**Adding a new feature page:**
1. Create `src/pages/features/<name>/<Name>.tsx`
2. Add a `<Route>` in `src/App.tsx`
3. Add an entry to the `features` array in `src/pages/Home.tsx` (this is what populates the home grid)

**Data pattern:** `WorkoutPlan.tsx` shows the established pattern for data-heavy pages — large typed data structures defined in the same file as the component, no external data files or API calls.
