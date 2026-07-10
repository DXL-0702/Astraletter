import type { Metadata } from "next"
import UniverseView from "@/components/universe/UniverseView"

export const metadata: Metadata = {
  title: "星宇 · Astraletter",
  description: "你们的关系星宇",
}

export default function StarUniversePage() {
  return <UniverseView />
}
