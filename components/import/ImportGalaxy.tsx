"use client"

import Galaxy from "@/components/mockup/Galaxy"

/**
 * 导入页的单一 WebGL 背景：固定全屏，恒定 calm 预设，**仅 hueShift 随导入状态变化**
 * （Galaxy 有独立的 hot-update useEffect，不重建 WebGL 上下文）。
 * 开启 mouseInteraction：星随光标聚拢（鼠标聚焦效果）；UI 在 z-ui(50) 上层，仍可正常点按。
 */
export default function ImportGalaxy({ hue }: { hue: number }) {
  return (
    <div className="fixed inset-0 z-canvas" aria-hidden="true">
      <Galaxy
        transparent
        hueShift={hue}
        saturation={0.45}
        glowIntensity={0.45}
        density={1.1}
        twinkleIntensity={0.3}
        rotationSpeed={0.03}
        starSpeed={0.3}
        mouseInteraction
      />
    </div>
  )
}
