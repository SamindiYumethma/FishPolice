"use client";

import { RebirthFlow } from "../../play/RebirthFlow";
import { useRequireProfile } from "../../state/PlayerProvider";

export default function RebirthPage() {
  const hasDetective = useRequireProfile();
  return hasDetective ? <RebirthFlow /> : null;
}
