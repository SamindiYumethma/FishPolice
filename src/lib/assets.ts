import manifest from "./asset-manifest.json";

export type AssetName = keyof typeof manifest;

export function assetUrl(name: AssetName): string {
  return `/assets/${name}.webp`;
}

/** width / height of the trimmed asset. */
export function assetRatio(name: AssetName): number {
  const { w, h } = manifest[name];
  return w / h;
}
