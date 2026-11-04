type Listener<T> = (payload: T) => void;

/**
 * A small publish/subscribe base class. The game logic only announces what happened;
 * whoever cares (React screens, the save system, later sound) subscribes.
 * The event map makes every event name and payload type-checked.
 */
export class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  /** Subscribes to an event and returns the function that unsubscribes. */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const set = (this.listeners[event] ??= new Set());
    set.add(listener);
    return () => set.delete(listener);
  }

  protected emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    // Copied so a listener can safely unsubscribe while the event is being delivered.
    for (const listener of [...(this.listeners[event] ?? [])]) listener(payload);
  }
}
