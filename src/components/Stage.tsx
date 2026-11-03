import type { ReactNode } from "react";
import { Sprite } from "./ui";

/**
 * Phone-shaped play area. Fills the screen on phones; on tablets / desktops it
 * shows as a centred phone column over a blurred reef.
 */
export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="stage-outer">
      <div className="stage-backdrop" aria-hidden />
      <main className="stage">{children}</main>
      <div className="rotate-overlay">
        <Sprite name="hero_shocked" />
        <span>Please rotate your phone to portrait</span>
      </div>
    </div>
  );
}
