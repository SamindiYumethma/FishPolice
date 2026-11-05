# Fish Police: The Treasure Heist

An underwater detective game for phones. Arrest the fish criminals, leave the innocent fish alone, and hit the target score before the clock runs out to unlock each stolen treasure chest.

Lose a case and you can win the life back in a Rebirth Challenge: one photo from the Fish API, one chance to count its fish and treasure chests.

Built with Next.js, Node.js and TypeScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # game logic and server tests
npm run typecheck
```

On a computer the game shows as a phone-shaped column. To try it on a real phone, connect to the same Wi-Fi and open `http://<your-computer-ip>:3000`.

The Rebirth Challenge needs internet access, for the Fish API. `next build` needs it too, for Google Fonts.

### Configuration

`.env.local` is optional for development:

```bash
REBIRTH_TOKEN_SECRET=any-long-random-text
```

This is the key that encrypts each challenge's answers. Without it the server makes a random one when it starts, so challenges open during a restart stop working. Always set it in production. `.env*` files are ignored by git, so keys are never uploaded.

## How the code is organised

| Folder | Job | Knows about |
| --- | --- | --- |
| `src/game/` | The rules: engine, levels, characters, lives, progress and rebirth | Nothing else (no React, no browser) |
| `src/server/` | Runs on the server only: Fish API calls, encrypted challenge tokens, answer checks | `game/` |
| `src/data/` | Where a save is stored, behind the `PlayerRepository` interface | The save format |
| `src/state/` | Shares the save with every screen | `game/`, `data/` |
| `src/play/` | The screens of a case, and the link between engine and browser | `game/`, `state/` |
| `src/app/` | The pages and the `/api/rebirth/*` routes (Next.js routes) | Everything above |
| `src/components/` | Reusable UI pieces (buttons, panels, hearts) | Asset names |

## Build status

- [x] **Phase 1: core game.** Engine, 10 cases with rising difficulty, lives, game over, saved progress, guest play.
- [x] **Phase 2: Rebirth Challenge.** Fish API through Node.js routes on the server: one chance each, up to 3 per run, with less time (20s, 15s, 10s) and busier photos each time.
- [ ] **Phase 3: Firebase.** Accounts, sessions, cloud saves, leaderboard.
- [ ] **Phase 4: polish.** Sound, settings, extra characters, more cases.

Sign-up and login screens exist, but only explain that accounts aren't connected yet (Phase 3).

## References

See [REFERENCES.md](REFERENCES.md) for third-party code, assets and AI assistance.
