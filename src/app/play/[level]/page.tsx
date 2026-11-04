"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseLevel } from "../../../game/levels";
import { PlayGame } from "../../../play/PlayGame";
import { useRequireProfile } from "../../../state/PlayerProvider";

export default function PlayPage({ params }: { params: Promise<{ level: string }> }) {
  const level = parseLevel(use(params).level);
  const router = useRouter();
  const hasDetective = useRequireProfile();

  // Anything that isn't a real case number goes back to the map.
  useEffect(() => {
    if (level === null) router.replace("/cases");
  }, [level, router]);

  if (level === null || !hasDetective) return null;
  return <PlayGame key={level} level={level} />;
}
