import type { CSSProperties, ReactNode } from "react";
import { assetUrl, type AssetName } from "../lib/assets";
import { Bubbles } from "./ui";

export function Screen({
  bg,
  children,
  className = "",
  bubbles,
  style,
}: {
  bg: AssetName;
  children: ReactNode;
  className?: string;
  bubbles?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={`screen ${className}`} style={style}>
      <div className="screen-bg" style={{ backgroundImage: `url(${assetUrl(bg)})` }} aria-hidden />
      {bubbles && <Bubbles />}
      {children}
    </div>
  );
}
