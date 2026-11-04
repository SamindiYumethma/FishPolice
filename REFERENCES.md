# References

Code and material in this project that was not written by the author.

## AI assistance

**Claude** (Anthropic), used through Claude Code, model Claude Opus 5.5, November 2026.

Phase 1 files generated with this tool, then reviewed by the author:

- `src/game/`: all files, including tests
- `src/data/`: all files
- `src/state/PlayerProvider.tsx`
- `src/play/GameBoard.tsx`, `src/play/CaseRun.tsx`, `src/play/PlayGame.tsx`
- `src/components/AccountsNotice.tsx`
- `src/app/game-over/page.tsx`
- Edited to use the real game logic: `src/play/PhaseScreens.tsx`, `src/components/HowToPlay.tsx`, and the pages in `src/app/`

## Existing UI code

The UI demo from the first commit (`src/components/`, the CSS modules, and the layout of the pages):

> **TODO (author):** state where this came from: written by you, or generated with a tool (which one, and when)?

## Algorithms

- `seededRng` in `src/game/testUtils.ts`: mulberry32, a public-domain random number generator by Tommy Ettinger.

## Libraries

- [Next.js](https://nextjs.org/) and [React](https://react.dev/): application framework
- [Vitest](https://vitest.dev/): test runner
- [Lilita One](https://fonts.google.com/specimen/Lilita+One) and [Nunito](https://fonts.google.com/specimen/Nunito): fonts, through Google Fonts

## Assets

Images in `public/assets/`:

> **TODO (author):** state where these came from.

## Services (from Phase 2)

- [The Fish Game API](https://marcconrad.com/uob/fish/api.php) by Marc Conrad
