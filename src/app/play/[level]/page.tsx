"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PLAYABLE_LEVEL } from "../../../lib/mock";
import { PlayDemo } from "../../../play/PlayDemo";

export default function PlayPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const router = useRouter();
  const playable = Number(level) === PLAYABLE_LEVEL;

  // Only Case 1 exists; any other level goes back to the map.
  useEffect(() => {
    if (!playable) router.replace("/cases");
  }, [playable, router]);

  if (!playable) return null;
  return <PlayDemo key={level} level={PLAYABLE_LEVEL} />;
}
