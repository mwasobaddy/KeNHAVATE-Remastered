import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 dark:bg-[#FFF200] dark:text-[#231F20] dark:hover:bg-[#E6D900]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400",
        warning:
          "bg-amber-500 text-white shadow-xs hover:bg-amber-400 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300",
        info:
          "bg-sky-600 text-white shadow-xs hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400",
        premium:
          "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs hover:from-violet-500 hover:to-purple-500 dark:from-violet-500 dark:to-purple-500 dark:hover:from-violet-400 dark:hover:to-purple-400",
        beige:
          "bg-beige text-[#231F20] shadow-xs hover:bg-beige/80 dark:bg-[#2A2620] dark:text-[#F8EBD5] dark:hover:bg-[#3A362E]",
        gray:
          "bg-[#9B9EA4] text-white shadow-xs hover:bg-[#9B9EA4]/80 dark:bg-[#9B9EA4] dark:text-white dark:hover:bg-[#9B9EA4]/80",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
