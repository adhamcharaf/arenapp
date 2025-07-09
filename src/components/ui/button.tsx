'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-ci-orange text-white hover:bg-ci-orange/90 focus-visible:ring-ci-orange',
        green: 'bg-ci-green text-white hover:bg-ci-green/90 focus-visible:ring-ci-green',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900',
        ghost: 'bg-transparent hover:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 rounded-md',
        md: 'h-10 px-4 rounded-md',
        lg: 'h-12 px-6 rounded-lg text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }