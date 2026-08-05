import { forwardRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChatFloatingButtonProps {
  isOpen: boolean
  panelId: string
  onClick: () => void
}

export const ChatFloatingButton = forwardRef<
  HTMLButtonElement,
  ChatFloatingButtonProps
>(function ChatFloatingButton({ isOpen, panelId, onClick }, ref) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={panelId}
      className={cn(
        "fixed right-4 bottom-4 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-lg ring-1 ring-foreground/10 transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:right-6 sm:bottom-6",
        "min-w-14 justify-center sm:min-w-fit sm:justify-start"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
    >
      <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
      <span className="sr-only text-sm font-medium whitespace-nowrap sm:not-sr-only">
        AI에게 물어보기
      </span>
    </motion.button>
  )
})
