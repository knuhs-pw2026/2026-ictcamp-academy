import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { useCopilotChat } from "@/components/copilot/copilot-chat-widget"

export function FinalCtaSection() {
  const { openChat } = useCopilotChat()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-primary/5 px-6 py-14 text-center sm:px-12"
      >
        <h2 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
          구매하기 전에, Review Guardian에게 확인해 보세요.
        </h2>
        <Button type="button" size="lg" onClick={openChat}>
          지금 질문하기
        </Button>
      </motion.div>
    </section>
  )
}
