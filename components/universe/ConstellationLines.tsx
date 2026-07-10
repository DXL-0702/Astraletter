"use client"

import { useMemo } from "react"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"

/** 星座连线：沿时间线连接同簇相邻星（细弱白线，营造星座骨架）。 */
export default function ConstellationLines({ stars }: { stars: Star[] }) {
  const geometry = useMemo(() => {
    const pts: number[] = []
    for (let i = 1; i < stars.length; i++) {
      if (stars[i].clusterId === stars[i - 1].clusterId) {
        const a = stars[i - 1].position
        const b = stars[i].position
        pts.push(a[0], a[1], a[2], b[0], b[1], b[2])
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [stars])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#9db4e8" transparent opacity={0.05} toneMapped={false} />
    </lineSegments>
  )
}
