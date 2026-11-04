# Fish Police: The Treasure Heist

An underwater detective game for phones. Arrest the fish criminals, leave the innocent fish alone, and hit the target score before the clock runs out to unlock each stolen treasure chest.

Built with Next.js and TypeScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # game logic tests
npm run typecheck
```

On a computer the game shows as a phone-shaped column. To try it on a real phone, connect to the same Wi-Fi and open `http://<your-computer-ip>:3000`.

## How the code is organised

| Folder | Job | Knows about |
| --- | --- | --- |
| `src/game/` | The rules: engine, levels, characters, lives and progress | Nothing else (no React, no browser) |
| `src/data/` | Where a save is stored, behind the `PlayerRepository` interface | The save format |
| `src/state/` | Shares the save with every screen | `game/`, `data/` |
| `src/play/` | The screens of a case, and the link between engine and browser | `game/`, `state/` |
| `src/app/` | The pages (Next.js routes) | Everything above |
| `src/components/` | Reusable UI pieces (buttons, panels, hearts) | Asset names |

## Build status

- [x] **Phase 1: core game.** Engine, 10 cases with rising difficulty, lives, game over, saved progress, guest play.
- [ ] **Phase 2: Rebirth Challenge.** Fish API through a Node.js route on the server.
- [ ] **Phase 3: Firebase.** Accounts, sessions, cloud saves, leaderboard.
- [ ] **Phase 4: polish.** Sound, settings, extra characters, more cases.

Sign-up and login screens exist, but only explain that accounts aren't connected yet (Phase 3).

## References

See [REFERENCES.md](REFERENCES.md) for third-party code, assets and AI assistance.
