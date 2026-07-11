import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        starlight: "border-transparent bg-starlight/15 text-starlight",
        stellar: "border-transparent bg-stellar/15 text-stellar",
        magic: "border-transparent bg-magic/15 text-magic",
        outline: "border-border text-muted-foreground",
        destructive: "border-transparent bg-destructive/20 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
