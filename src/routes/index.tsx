import { createFileRoute } from "@tanstack/react-router"

import {
  Thermometer,
  TriangleAlert,
  MapPin,
  ShieldAlert,
  MessageCircle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">폭염 안전 대시보드</h1>

        <p className="mt-2 text-muted-foreground">
          현재 날씨, 폭염특보, 무더위쉼터 및 행동요령을 확인하세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              현재 날씨
            </CardTitle>

            <CardDescription>대구 달서구 신당동</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <p>기온 : 35℃</p>
              <p>습도 : 72%</p>
              <p>풍속 : 2.3m/s</p>
              <p>관측시각 : 14:00</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-red-500" />
              폭염 특보
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-red-600">폭염경보</p>

              <p>대구 달서구 신당동</p>

              <p className="text-sm text-muted-foreground">발표 시각: 10:00</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>위험도</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-red-600">HIGH</div>

            <p className="mt-2 text-sm text-muted-foreground">
              야외활동을 최소화하고 충분한 수분을 섭취하세요.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              주변 무더위쉼터
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">신당동 행정복지센터</p>

              <p className="text-sm text-muted-foreground">거리 350m</p>
            </div>

            <div>
              <p className="font-medium">달서구 노인복지관</p>

              <p className="text-sm text-muted-foreground">거리 820m</p>
            </div>

            <div>
              <p className="font-medium">계명대학교 성서도서관</p>

              <p className="text-sm text-muted-foreground">거리 1.1km</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              폭염 행동요령
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              <li>물을 자주 마시기</li>
              <li>오후 시간대 외출 자제</li>
              <li>냉방시설 적극 이용</li>
              <li>노약자 건강상태 확인</li>
              <li>충분한 휴식 취하기</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>AI 폭염 안전 상담</CardTitle>

          <CardDescription>Copilot Studio Agent와 실시간 상담</CardDescription>
        </CardHeader>

        <CardContent>
          <Button size="lg" className="w-full md:w-auto">
            <MessageCircle className="mr-2 h-4 w-4" />
            Copilot Agent 열기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
