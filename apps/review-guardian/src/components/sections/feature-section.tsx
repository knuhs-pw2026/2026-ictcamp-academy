import { motion, useReducedMotion } from "motion/react"
import { MessageSquareWarning, SlidersHorizontal, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCopilotChat } from "@/components/copilot/copilot-chat-widget"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  example: string
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "상품 적절성 평가",
    description:
      "상품의 주요 장단점과 사용 목적에 대한 적합성을 확인 가능한 후기 근거와 함께 살펴봅니다.",
    example: "이 상품이 제 용도에 적합한가요?",
  },
  {
    icon: MessageSquareWarning,
    title: "후기 및 주장 검증",
    description:
      "특정 후기나 반복적으로 언급되는 문제를 확보 가능한 데이터와 대조해 근거 수준을 안내합니다.",
    example: "금방 고장 난다는 후기를 믿어도 될까요?",
  },
  {
    icon: SlidersHorizontal,
    title: "조건 기반 상품 추천",
    description:
      "카테고리, 사용 목적, 예산과 필수 조건을 고려해 검증 가능한 상품 선택을 돕습니다.",
    example: "10만 원 이하 무선 이어폰을 추천해 주세요.",
  },
]

export function FeatureSection() {
  const { openChat } = useCopilotChat()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="features"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
          구매 전 확인해야 할 세 가지
        </h2>
        <p className="mt-3 text-sm text-pretty text-muted-foreground sm:text-base">
          Review Guardian이 근거 중심으로 도와드리는 핵심 기능입니다.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3 text-base">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-pretty wrap-break-word">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="rounded-lg bg-secondary/50 px-3 py-2 text-xs wrap-break-word text-secondary-foreground">
                  “{feature.example}”
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={openChat}
                >
                  질문하기
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
