---
name: develop
description: End-to-end development workflow for this repo (fandok.github.io). Use when the user asks to build, add, change or fix something in the site — a new feature page, a UI tweak, a bug fix. Plans from the request, analyzes requirements, implements on a new branch, loops review-and-fix until clean, pushes, then reminds the user to open a PR.
---

# Develop workflow

Follow these phases in order. Do not skip a phase; keep each one short when the change is small.

## 1. Plan

- Restate what the user wants in 1–3 sentences.
- Read the relevant code first (`src/App.tsx`, `src/pages/Home.tsx`, the feature folder being touched, and `CLAUDE.md`).
- Write a short plan: files to create/change, the approach, and anything out of scope.
- If a requirement is genuinely ambiguous (content, layout, behavior the user must decide), ask **before** coding. Otherwise pick a sensible default and state it.
- For anything larger than a small tweak, show the plan and wait for the user's go-ahead.

## 2. Analyze requirements

Turn the request into a checklist of acceptance criteria, e.g.:

- [ ] Route `/foo` renders the page
- [ ] Page appears in the home grid
- [ ] Works on mobile width (~375px) and wide screens
- [ ] `npm run build` and `npm run lint` pass

Check it against repo conventions:

- **New feature page** → all three steps from `CLAUDE.md`:
  1. `src/pages/features/<name>/<Name>.tsx`
  2. `<Route>` in `src/App.tsx`
  3. entry in the `features` array in `src/pages/Home.tsx`
- Data-heavy pages: typed data in the same file as the component (see `WorkoutPlan.tsx`). No external data files or API calls.
- Styles: CSS Modules for pages, inline styles for feature components.
- Do not touch the OXC + Babel/React Compiler setup in `vite.config.ts`.

## 3. Branch

- Start from up-to-date `main`: `git fetch origin main`.
- Create a branch named after the work, matching repo history: `feat/<short-name>` or `fix/<short-name>`.
  - **Exception:** if the session/system instructions name a required development branch (e.g. cloud sessions on `claude/...`), use that branch instead.
- Never commit directly to `main`.

## 4. Implement

- Make the changes from the plan. Keep the diff focused; no unrelated refactors.
- Run `npm install` if `node_modules` is missing.
- Commit in logical steps with conventional messages (`feat: ...`, `fix: ...`).

## 5. Review → fix loop

Repeat until a round produces no issues to fix (max ~4 rounds; if still failing, stop and report to the user):

1. **Checks:** `npm run lint` and `npm run build`. Both must pass with no errors.
2. **Code review:** run the `/code-review` skill on the current diff (medium effort is enough for normal changes). Also use `/simplify` if the diff feels heavy.
3. **Requirements check:** go through the acceptance checklist from phase 2 and tick each item honestly.
4. **Visual check (UI changes):** run the app (`npm run dev` or `npm run build && npm run preview`) and take Playwright screenshots at phone and desktop widths. Look at them.
5. Fix every real issue found, commit the fixes, and go back to step 1.

Only leave the loop when: lint clean, build clean, review has no remaining correctness findings, and every checklist item is met.

## 6. Push

- `git push -u origin <branch>`; retry up to 4 times with backoff on network errors.
- Do **not** open a PR yourself.

## 7. Wrap up and remind

Finish with a short summary:

- What changed (files + one line each)
- Review rounds run and what was fixed
- Final check status (lint / build)
- Then a clear reminder, e.g.:

> ✅ Pushed to `<branch>`. **Reminder: open a PR from `<branch>` into `main`** to get this merged and deployed.
> https://github.com/fandok/fandok.github.io/compare/main...<branch>
