"use client"

import { forwardRef, useMemo } from "react"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"

interface Props {
  stars: Star[]
  selectedId?: string | null
}

/** 生成径向渐变 sprite（白心 → 透明），运行时 canvas，无需静态资源。 */
function makeStarSprite(): THREE.Texture {
  if (typeof document === "undefined") return new THREE.Texture()
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.2, "rgba(255,255,255,0.85)")
  g.addColorStop(0.5, "rgba(255,255,255,0.25)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * 发光星辰：单 draw call 加色混合点云 + 逐星情感顶点色；选中星提亮。
 * 选择（点按）由 FlyController 经 ref 做射线检测处理，本组件只负责渲染。
 */
const StarField3D = forwardRef<THREE.Points, Props>(function StarField3D(
  { stars, selectedId },
  ref
) {
  const sprite = useMemo(makeStarSprite, [])

  const positions = useMemo(() => {
    const a = new Float32Array(stars.length * 3)
    stars.forEach((s, i) => {
      a[i * 3] = s.position[0]
      a[i * 3 + 1] = s.position[1]
      a[i * 3 + 2] = s.position[2]
    })
    return a
  }, [stars])

  const colors = useMemo(() => {
    const a = new Float32Array(stars.length * 3)
    stars.forEach((s, i) => {
      const boost = s.id === selectedId ? 2.4 : 1
      a[i * 3] = Math.min(1, s.color[0] * boost)
      a[i * 3 + 1] = Math.min(1, s.color[1] * boost)
      a[i * 3 + 2] = Math.min(1, s.color[2] * boost)
    })
    return a
  }, [stars, selectedId])

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={3.2}
        sizeAttenuation
        vertexColors
        map={sprite}
        alphaTest={0.01}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})

export default StarField3D
