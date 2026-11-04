import { parseSave, type PlayerSave } from "../game/player";
import type { PlayerRepository } from "./PlayerRepository";

const STORAGE_KEY = "fishpolice.save";

/** Keeps the save in this browser. If storage is blocked or full, the game still works until the page closes. */
export class LocalPlayerRepository implements PlayerRepository {
  private memory: string | null = null;

  async load(): Promise<PlayerSave | null> {
    let text = this.memory;
    try {
      text = window.localStorage.getItem(STORAGE_KEY) ?? this.memory;
    } catch {
      // Storage is blocked: fall back to the copy in memory.
    }
    return read(text);
  }

  async save(data: PlayerSave): Promise<void> {
    this.memory = JSON.stringify(data);
    try {
      window.localStorage.setItem(STORAGE_KEY, this.memory);
    } catch {
      // Storage is blocked or full: the copy in memory keeps this session going.
    }
  }

  /** The browser's storage event only fires in other tabs, which keeps open tabs in step. */
  subscribe(listener: (data: PlayerSave) => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const data = read(event.newValue);
      if (data) listener(data);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}

function read(text: string | null): PlayerSave | null {
  if (!text) return null;
  try {
    return parseSave(JSON.parse(text));
  } catch {
    return null;
  }
}
