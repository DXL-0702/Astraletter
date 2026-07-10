"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"

interface Props {
  /** 星点对象引用，用于点选射线检测 */
  pointsRef: MutableRefObject<THREE.Points | null>
  /** 索引 → 星，用于命中后回查 */
  stars: Star[]
  /** 速度（单位/秒），由父级拥有；本组件读取并在滚轮时回调更新 */
  speedRef: MutableRefObject<number>
  onSpeedChange?: (v: number) => void
  onSelect: (star: Star | null) => void
  /** 初始俯仰（弧度），让镜头大致朝向星海中心 */
  initialPitch?: number
}

const MAX_SPEED = 70
const MIN_SPEED = 0

/**
 * 诗云式飞行：持续向前漂移 + 拖拽转向 + 滚轮调速 + 点按（非拖拽）选星。
 * 点虚空则取消选中。触屏：拖拽转向、滑块调速（见 UI）。
 */
export default function FlyController({
  pointsRef,
  stars,
  speedRef,
  onSpeedChange,
  onSelect,
  initialPitch = -0.32,
}: Props) {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(initialPitch)
  const dragging = useRef(false)
  const dragged = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const ndc = useRef(new THREE.Vector2())
  const fwd = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))

  // 点云拾取阈值
  useEffect(() => {
    const p = raycaster.current.params.Points as { threshold: number } | undefined
    if (p) p.threshold = 1.1
  }, [])

  // 每帧：按 yaw/pitch 定朝向 + 前漂
  useFrame((_, delta) => {
    euler.current.set(pitch.current, yaw.current, 0, "YXZ")
    camera.quaternion.setFromEuler(euler.current)
    fwd.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    camera.position.addScaledVector(fwd.current, speedRef.current * Math.min(delta, 0.05))
  })

  useEffect(() => {
    const el = gl.domElement

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      dragged.current = false
      last.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !last.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      if (Math.abs(dx) + Math.abs(dy) > 4) dragged.current = true
      yaw.current -= dx * 0.0026
      pitch.current = Math.max(-1.45, Math.min(1.45, pitch.current - dy * 0.0026))
      last.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return // 来自非画布的释放（如点击 UI）则忽略，避免误取消选中
      const wasDragged = dragged.current
      dragging.current = false
      last.current = null
      if (wasDragged) return // 是转向，不是点按

      const points = pointsRef.current
      if (!points) {
        onSelect(null)
        return
      }
      const rect = el.getBoundingClientRect()
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(ndc.current, camera)
      const hits = raycaster.current.intersectObject(points)
      if (hits.length && hits[0].index != null && stars[hits[0].index]) {
        onSelect(stars[hits[0].index])
      } else {
        onSelect(null) // 点虚空 → 取消选中
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const next = Math.max(
        MIN_SPEED,
        Math.min(MAX_SPEED, speedRef.current * (e.deltaY < 0 ? 1.12 : 0.89))
      )
      speedRef.current = next
      onSpeedChange?.(next)
    }

    el.addEventListener("pointerdown", onDown)
    // move/up 绑到 window：指针移出画布甚至浏览器窗口也能正确结束拖拽，避免「粘滞」
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      el.removeEventListener("wheel", onWheel)
    }
  }, [gl, camera, pointsRef, stars, onSelect, onSpeedChange, speedRef])

  return null
}
