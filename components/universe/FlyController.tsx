"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { Star } from "@/lib/universe/types"

interface Props {
  pointsRef: MutableRefObject<THREE.Points | null>
  stars: Star[]
  /** WASD 移动速度（单位/秒），由父级滑块控制 */
  speedRef: MutableRefObject<number>
  onSelect: (star: Star | null) => void
  initialPitch?: number
}

const STEER_GAIN = 0.0024
const PITCH_LIMIT = 1.45
const SPRING = 0.15 // 临界阻尼弹簧响应时间（秒）：越小越跟手、越大越飘
const OMEGA = 2 / SPRING
const ZOOM_DECAY = 4 // 滚轮缩放速度衰减
const ZOOM_IMPULSE = 20 // 每个滚轮刻度注入的前/后速度（调小，缩放更柔）
const IDLE_DELAY = 700 // 多久无操作后开始绕中心自转（毫秒）
const ORBIT_SPEED = 0.06 // 空闲自转角速度（弧度/秒）
const UP = new THREE.Vector3(0, 1, 0)

const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"])
const mapKey = (k: string) =>
  k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k

/**
 * 飞行控制：WASD 移动 + 拖拽转向（指数缓动，松手阻尼收尾）+ 滚轮调远近 + 点按选星。
 * 已移除持续自动前漂与释放动量：移动完全由用户主动触发。
 */
export default function FlyController({
  pointsRef,
  stars,
  speedRef,
  onSelect,
  initialPitch = -0.32,
}: Props) {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(initialPitch)
  const curYaw = useRef(0)
  const curPitch = useRef(initialPitch)
  // 临界阻尼弹簧的速度状态（相机朝向用 spring 追随目标，取代指数缓动）
  const vYaw = useRef(0)
  const vPitch = useRef(0)
  const dragging = useRef(false)
  const dragged = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const zoomVel = useRef(0)
  const keys = useRef<Set<string>>(new Set())
  const raycaster = useRef(new THREE.Raycaster())
  const ndc = useRef(new THREE.Vector2())
  const fwd = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))
  const move = useRef(new THREE.Vector3())
  const lastWheel = useRef(0)
  const qOrbit = useRef(new THREE.Quaternion())
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  useEffect(() => {
    const p = raycaster.current.params.Points as { threshold: number } | undefined
    if (p) p.threshold = 1.1
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    // 空闲（无拖拽 / 无 WASD / 无近期滚轮）且非 reduced-motion：绕场景中心缓慢自转
    const idle =
      !dragging.current &&
      keys.current.size === 0 &&
      performance.now() - lastWheel.current > IDLE_DELAY &&
      !reduced.current
    if (idle) {
      const a = ORBIT_SPEED * dt
      // 整组相机绕世界 Y 轴转：位置 + 朝向同转，视线随行、无跳变（turntable）
      camera.position.applyAxisAngle(UP, a)
      qOrbit.current.setFromAxisAngle(UP, a)
      camera.quaternion.premultiply(qOrbit.current)
      // 同步 yaw/pitch 到实际朝向，保证切回第一人称时连续
      euler.current.setFromQuaternion(camera.quaternion, "YXZ")
      yaw.current = curYaw.current = euler.current.y
      pitch.current = curPitch.current = euler.current.x
      vYaw.current = 0
      vPitch.current = 0
      return
    }

    // 第一人称：spring 朝向 + WASD + 滚轮
    const x = OMEGA * dt
    const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
    const cy = curYaw.current - yaw.current
    const ty = (vYaw.current + OMEGA * cy) * dt
    vYaw.current = (vYaw.current - OMEGA * ty) * e
    curYaw.current = yaw.current + (cy + ty) * e
    const cp = curPitch.current - pitch.current
    const tp = (vPitch.current + OMEGA * cp) * dt
    vPitch.current = (vPitch.current - OMEGA * tp) * e
    curPitch.current = pitch.current + (cp + tp) * e
    euler.current.set(curPitch.current, curYaw.current, 0, "YXZ")
    camera.quaternion.setFromEuler(euler.current)
    fwd.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion)

    // WASD 移动（W/S 前/后，A/D 左/右平移）
    const ks = keys.current
    const f = (ks.has("w") ? 1 : 0) - (ks.has("s") ? 1 : 0)
    const s = (ks.has("d") ? 1 : 0) - (ks.has("a") ? 1 : 0)
    if (f !== 0 || s !== 0) {
      move.current.set(0, 0, 0).addScaledVector(fwd.current, f).addScaledVector(right.current, s)
      if (move.current.lengthSq() > 0) move.current.normalize()
      camera.position.addScaledVector(move.current, speedRef.current * dt)
    }

    // 滚轮调远近：沿视线阻尼滑行
    if (Math.abs(zoomVel.current) > 0.001) {
      camera.position.addScaledVector(fwd.current, zoomVel.current * dt)
      zoomVel.current *= Math.exp(-ZOOM_DECAY * dt)
    }
  })

  useEffect(() => {
    const el = gl.domElement

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      dragged.current = false
      vYaw.current = 0
      vPitch.current = 0
      last.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !last.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      if (Math.abs(dx) + Math.abs(dy) > 4) dragged.current = true
      yaw.current -= dx * STEER_GAIN
      pitch.current = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch.current - dy * STEER_GAIN))
      last.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return // 来自非画布的释放（如点 UI）则忽略
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
      if (hits.length && hits[0].index != null && stars[hits[0].index]) onSelect(stars[hits[0].index])
      else onSelect(null) // 点虚空 → 取消选中
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      lastWheel.current = performance.now()
      // 上滚靠近、下滚远离；注入速度后阻尼衰减，丝滑缩放
      zoomVel.current += (e.deltaY < 0 ? 1 : -1) * ZOOM_IMPULSE
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      const key = e.key.toLowerCase()
      if (MOVE_KEYS.has(key)) {
        keys.current.add(mapKey(key))
        e.preventDefault()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(mapKey(e.key.toLowerCase()))
    }
    const clearKeys = () => keys.current.clear()

    el.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    el.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", clearKeys)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      el.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", clearKeys)
    }
  }, [gl, camera, pointsRef, stars, onSelect])

  return null
}
