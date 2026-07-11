"use client"

import { useMemo } from "react"
import * as THREE from "three"
import type { Cluster, Star } from "@/lib/universe/types"

/** 星座连线：沿时间线连接同簇相邻星，每簇用各自的冷色宝石色（vertexColors）。 */
export default function ConstellationLines({
  stars,
  clusters,
}: {
  stars: Star[]
  clusters: Cluster[]
}) {
  const geometry = useMemo(() => {
    const cmap = new Map<number, [number, number, number]>()
    for (const c of clusters) cmap.set(c.id, c.color)
    const pts: number[] = []
    const cols: number[] = []
    const fallback: [number, number, number] = [0.7, 0.85, 0.85]
    for (let i = 1; i < stars.length; i++) {
      if (stars[i].clusterId === stars[i - 1].clusterId) {
        const a = stars[i - 1].position
        const b = stars[i].position
        pts.push(a[0], a[1], a[2], b[0], b[1], b[2])
        const col = cmap.get(stars[i].clusterId) ?? fallback
        cols.push(col[0], col[1], col[2], col[0], col[1], col[2])
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3))
    return g
  }, [stars, clusters])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.45} toneMapped={false} />
    </lineSegments>
  )
}
