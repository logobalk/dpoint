import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "gradient-bg text-white hover:scale-105 transform",
        primary: "gradient-bg text-white hover:scale-105 transform",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 card-shadow",
        outline: "border border-primary-500 text-primary-500 hover:bg-primary-50",
        ghost: "hover:bg-gray-100 text-gray-700",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 transform",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 transform",
        error: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 transform",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-4 py-3",
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
