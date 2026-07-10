"use client"

import "./StarBorder.css"
import type { ElementType, ReactNode } from "react"

type StarBorderProps = {
  as?: ElementType
  className?: string
  color?: string
  speed?: string
  thickness?: number
  children?: ReactNode
} & Record<string, unknown>

export default function StarBorder({
  as: Component = "div",
  className = "",
  color = "oklch(0.80 0.16 80)",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps) {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{ padding: `${thickness}px 0`, ...(rest.style as object) }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="inner-content">{children}</div>
    </Component>
  )
}
