import { motion, useReducedMotion } from "motion/react"

const STEPS = [
  "상품이나 후기 입력",
  "확인 가능한 정보 탐색",
  "후기 신뢰성과 상품 적합성 분석",
  "근거와 한계를 포함한 결과 확인",
]

export function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="how-it-works"
      className="border-y border-border/70 bg-secondary/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
            이용 방법
          </h2>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.li
              key={step}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.35,
                delay: index * 0.06,
                ease: "easeOut",
              }}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-pretty wrap-break-word text-foreground">
                {step}
              </p>
            </motion.li>
          ))}
        </ol>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          확인 가능한 출처와 데이터 범위에 따라 분석 결과가 달라질 수 있습니다.
        </p>
      </div>
    </section>
  )
}
