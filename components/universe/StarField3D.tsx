"use client"

import { Instance, Instances } from "@react-three/drei"
import { ThreeEvent } from "@react-three/fiber"
import type { Star } from "@/lib/universe/types"

interface Props {
  stars: Star[]
  selectedId?: string | null
  onSelect: (star: Star) => void
}

/** 实例化星星：单 draw call，逐颗颜色/大小/点击。 */
export default function StarField3D({ stars, selectedId, onSelect }: Props) {
  return (
    <Instances limit={stars.length} range={stars.length} castShadow={false} receiveShadow={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
      {stars.map((s) => {
        const selected = s.id === selectedId
        return (
          <Instance
            key={s.id}
            position={s.position}
            scale={selected ? s.size * 2.2 : s.size}
            color={s.color}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              onSelect(s)
            }}
          />
        )
      })}
    </Instances>
  )
}
