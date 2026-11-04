import type { PlayerSave } from "../game/player";

/**
 * Where a player's save lives. The rest of the game only knows this interface, so moving
 * saves to a different store means writing one new class. It is async because a remote
 * database can't answer instantly.
 */
export interface PlayerRepository {
  /** Returns the stored save, or null if there isn't a usable one. */
  load(): Promise<PlayerSave | null>;
  save(data: PlayerSave): Promise<void>;
  /** Calls back when the save is changed from elsewhere. Returns the function that unsubscribes. */
  subscribe(listener: (data: PlayerSave) => void): () => void;
}
