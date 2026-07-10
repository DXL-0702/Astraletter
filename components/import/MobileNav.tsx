"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Menu, Shield, Sparkles } from "lucide-react"

type Target = "how" | "privacy"

interface Props {
  onNavigate: (target: Target) => void
}

const ITEMS: { icon: typeof Sparkles; label: string; target: Target; color: string }[] = [
  { icon: Sparkles, label: "如何生成", target: "how", color: "text-starlight" },
  { icon: Shield, label: "隐私承诺", target: "privacy", color: "text-success" },
]

/** 移动端导航：点按打开对应叙事 Dialog（与桌面一致）。键盘/焦点由 Radix 管理。 */
export default function MobileNav({ onNavigate }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-modal min-w-[176px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-float backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          {ITEMS.map((it) => (
            <DropdownMenu.Item
              key={it.target}
              onSelect={() => onNavigate(it.target)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
            >
              <it.icon className={`h-4 w-4 ${it.color}`} /> {it.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
