# Fish Police — UI Demo

A standalone copy of the game's **screens and navigation only**, for demonstrating the UI.
There is no game logic, no login/backend, no saving and no sound. All the numbers shown are sample data from `src/lib/mock.ts`.

## Run it

```bash
cd ui-demo
npm install
npm run dev
```

Then open http://localhost:3001 (it uses port 3001 so it can run beside the main game on 3000).

## Screen flow

```
Loading → Welcome ─┬─ Sign up ──→ Profile setup ──→ Menu
                   ├─ Log in ───→ Menu   (Forgot password from here)
                   └─ Play as guest → Profile setup

Menu ─┬─ Play → Case map → Case briefing → 3-2-1 countdown → Gameplay (static board)
      ├─ Leaderboard                                          ├─ Pause menu (Resume / Restart / Quit)
      ├─ Settings (Account, Log out, Delete dialogs)          ├─ Demo: "Show win"  → Chest unlocked → next case / map
      ├─ How to play (popup)                                  └─ Demo: "Show fail" → Case failed
      └─ Avatar → Edit detective                                   └─ Earn it back → Rebirth challenge
                                                                        ├─ Submit → Life recovered
                                                                        └─ Demo: "Show wrong answer" → Not quite! → Give up → Game over
```

The small dark **Demo:** bars exist only in this demo so the win / fail screens can be shown without playing.
Only Case 1 is playable; every other case is locked on the map, and /play/<n> for any other level sends you back to the map.
