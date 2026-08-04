import { useState, type ReactNode } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Building2,
  Clock3,
  CloudRain,
  Droplets,
  ExternalLink,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Snowflake,
  Sun,
  Thermometer,
  TriangleAlert,
  Users,
  Wind,
} from "lucide-react"

import { useKmaDashboard } from "@/hooks/use-kma-dashboard"
import { formatKstObservationTime } from "@/lib/date-kst"

import {
  DEFAULT_SINDANG_LOCATION,
  useCoolingShelters,
} from "@/hooks/use-cooling-shelters"

import type { CoolingShelter } from "@/api/cooling-shelter"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

const LOCATION_NAME = "대구 달서구 신당동"

function DashboardPage() {
  const {
    gridQuery,
    weatherQuery,
    warningQuery,
    isLoading,
    isFetching,
    refetchAll,
  } = useKmaDashboard()

  const shelterQuery = useCoolingShelters({
    latitude: DEFAULT_SINDANG_LOCATION.latitude,
    longitude: DEFAULT_SINDANG_LOCATION.longitude,
    radiusKm: 5,
  })

  const shelters = shelterQuery.data ?? []

  const [isChatOpen, setIsChatOpen] = useState(false)

  const weather = weatherQuery.data
  const warning = warningQuery.data

  const hasHeatWarning = warning?.hasHeatWarning ?? false

  const risk = calculateRisk({
    temperature: weather?.temperature ?? null,
    humidity: weather?.humidity ?? null,
    hasHeatWarning,
  })

  const error =
    gridQuery.error ??
    weatherQuery.error ??
    warningQuery.error ??
    shelterQuery.error

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <DashboardBackground />

      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          hasHeatWarning
            ? "border-red-400/30 bg-linear-to-r from-red-600 to-rose-600 text-white"
            : "border-slate-200 bg-white/80 text-slate-700"
        }`}
      >
        <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            {hasHeatWarning ? (
              <TriangleAlert className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-emerald-500" />
            )}

            <span>
              {hasHeatWarning
                ? "현재 위치와 관련된 폭염 특보가 조회되었습니다."
                : "현재 조회 결과에서 폭염 특보가 확인되지 않았습니다."}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={
              hasHeatWarning
                ? "shrink-0 text-white hover:bg-white/10 hover:text-white"
                : "shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }
            disabled={isFetching || shelterQuery.isFetching}
            onClick={() => {
              void Promise.all([refetchAll(), shelterQuery.refetch()])
            }}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isFetching || shelterQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            새로고침
          </Button>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 flex flex-col gap-5 text-slate-900 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 border-transparent bg-linear-to-r from-orange-500 to-rose-500 text-white hover:from-orange-500 hover:to-rose-500">
              <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
              실시간 기상 관측
            </Badge>

            <h1 className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
              폭염 안전 대시보드
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              현재 날씨와 기상특보를 확인하고 폭염으로부터 안전하게 대비하세요.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <MapPin className="h-5 w-5 text-orange-500" />

            <div>
              <div className="text-xs text-slate-400">현재 조회 지역</div>
              <div className="font-semibold">{LOCATION_NAME}</div>
            </div>
          </div>
        </header>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50 text-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>기상 데이터를 불러오지 못했습니다.</AlertTitle>
            <AlertDescription>
              {getErrorMessage(error)}
              <br />
              브라우저 콘솔에 CORS 오류가 표시된다면 API 프록시 URL을
              사용하세요.
            </AlertDescription>
          </Alert>
        )}

        <HeroSection
          isLoading={isLoading}
          temperature={weather?.temperature ?? null}
          humidity={weather?.humidity ?? null}
          hasHeatWarning={hasHeatWarning}
          risk={risk}
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            loading={weatherQuery.isLoading}
            icon={<Thermometer className="h-5 w-5" />}
            label="현재 기온"
            value={formatValue(weather?.temperature, "℃")}
            description="초단기실황 T1H"
            accent="from-orange-400 to-red-500"
            iconClassName="bg-orange-100 text-orange-600"
          />

          <StatCard
            loading={weatherQuery.isLoading}
            icon={<Droplets className="h-5 w-5" />}
            label="상대습도"
            value={formatValue(weather?.humidity, "%")}
            description="초단기실황 REH"
            accent="from-cyan-400 to-blue-500"
            iconClassName="bg-cyan-100 text-cyan-700"
          />

          <StatCard
            loading={weatherQuery.isLoading}
            icon={<Wind className="h-5 w-5" />}
            label="풍속"
            value={formatValue(weather?.windSpeed, "m/s")}
            description="초단기실황 WSD"
            accent="from-emerald-400 to-green-500"
            iconClassName="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            loading={weatherQuery.isLoading}
            icon={<CloudRain className="h-5 w-5" />}
            label="1시간 강수량"
            value={formatValue(weather?.rainfall, "mm")}
            description="초단기실황 RN1"
            accent="from-indigo-400 to-violet-500"
            iconClassName="bg-indigo-100 text-indigo-700"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-slate-200/70 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    폭염 위험도
                  </CardTitle>
                  <CardDescription className="mt-1">
                    기온·습도·특보 정보를 이용한 화면 표시용 위험도입니다.
                  </CardDescription>
                </div>

                <RiskBadge risk={risk} />
              </div>
            </CardHeader>

            <CardContent>
              {weatherQuery.isLoading ? (
                <Skeleton className="h-36 w-full rounded-2xl" />
              ) : (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className={`text-5xl font-black ${risk.textColor}`}>
                        {risk.label}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {risk.message}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        위험 지수
                      </div>
                      <div className="text-3xl font-black">
                        {risk.score}
                        <span className="text-base text-muted-foreground">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  <Progress value={risk.score} className="mt-6 h-3" />

                  <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock3 className="h-4 w-4" />
                      관측 시각
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatKstObservationTime(
                        weather?.baseDate ?? undefined,
                        weather?.baseTime ?? undefined
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TriangleAlert className="h-5 w-5 text-orange-500" />
                    기상특보 현황
                  </CardTitle>
                  <CardDescription className="mt-1">
                    기상청 특보현황 API 조회 결과
                  </CardDescription>
                </div>

                <Badge variant={hasHeatWarning ? "destructive" : "secondary"}>
                  {hasHeatWarning ? "폭염 특보 확인" : "확인된 특보 없음"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {warningQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : warning?.warnings.length ? (
                <div className="space-y-3">
                  {warning.warnings.slice(0, 4).map((item) => (
                    <div
                      key={`${item.districtCode}-${item.effectiveAt}`}
                      className="rounded-2xl border border-red-200 bg-red-50 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                          <TriangleAlert className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-red-950">
                              {item.districtName}
                            </h3>

                            <Badge variant="destructive">
                              {item.warningType} {item.warningLevel}
                            </Badge>

                            {item.command && (
                              <Badge
                                variant="outline"
                                className="border-red-200 text-red-700"
                              >
                                {item.command}
                              </Badge>
                            )}
                          </div>

                          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-muted-foreground">
                                발표 시각
                              </dt>
                              <dd className="mt-1 font-medium text-slate-900">
                                {formatWarningDateTime(item.announcedAt)}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-muted-foreground">
                                발효 시각
                              </dt>
                              <dd className="mt-1 font-medium text-slate-900">
                                {formatWarningDateTime(item.effectiveAt)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <ShieldAlert className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="font-semibold text-emerald-950">
                        폭염 특보 미확인
                      </div>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        현재 API 응답에서 대구 또는 달서구 관련 폭염 문구가
                        확인되지 않았습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">발효시간 기준</Badge>
                <Badge variant="outline">
                  요청 시각:{" "}
                  {warning?.requestedAt
                    ? formatWarningDateTime(warning?.requestedAt)
                    : "-"}
                </Badge>
                {gridQuery.data && (
                  <Badge variant="outline">
                    격자: {gridQuery.data.nx}, {gridQuery.data.ny}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    주변 무더위쉼터
                  </CardTitle>

                  <CardDescription className="mt-1">
                    {LOCATION_NAME} 기준 반경 5km 내 가까운 쉼터입니다.
                  </CardDescription>
                </div>

                {!shelterQuery.isLoading && (
                  <Badge
                    variant="secondary"
                    className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100"
                  >
                    {shelters.length}곳 조회
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="max-h-90 overflow-y-scroll">
              {shelterQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-44 w-full rounded-3xl" />
                  ))}
                </div>
              ) : shelterQuery.isError ? (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <AlertCircle className="h-7 w-7" />
                  </span>

                  <h3 className="mt-4 font-bold text-red-950">
                    쉼터 정보를 불러오지 못했습니다
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-red-800">
                    {getErrorMessage(shelterQuery.error)}
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4 border-red-200"
                    onClick={() => void shelterQuery.refetch()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    다시 시도
                  </Button>
                </div>
              ) : shelters.length > 0 ? (
                <div className="grid gap-4">
                  {shelters.map((shelter, index) => (
                    <CoolingShelterCard
                      key={shelter.id}
                      shelter={shelter}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <MapPin className="h-7 w-7" />
                  </span>

                  <h3 className="mt-4 font-bold">
                    반경 5km 내 쉼터가 없습니다
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    조회 반경을 확장하거나 잠시 후 다시 조회해 주세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-orange-500" />
                폭염 행동요령
              </CardTitle>
              <CardDescription>
                폭염이 심한 시간에는 야외활동을 최소화하세요.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <GuideCard
                  icon="💧"
                  title="수분 섭취"
                  description="갈증이 없더라도 물을 자주 마시세요."
                />
                <GuideCard
                  icon="🚫"
                  title="야외활동 자제"
                  description="더운 시간대의 외출과 작업을 줄이세요."
                />
                <GuideCard
                  icon="❄️"
                  title="시원한 장소 이용"
                  description="냉방시설이나 무더위쉼터를 이용하세요."
                />
                <GuideCard
                  icon="📞"
                  title="응급상황 대응"
                  description="의식 저하나 쓰러짐이 있으면 119에 연락하세요."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-8 pb-24 text-center text-xs leading-5 text-slate-400">
          기상 데이터는 기상청 API 조회 결과를 표시합니다.
          <br />
          화면의 위험도 점수는 의료 진단이나 정부 공식 위험 등급이 아닙니다.
        </footer>
      </main>

      <motion.button
        type="button"
        aria-label="AI 폭염 상담 열기"
        onClick={() => setIsChatOpen((current) => !current)}
        animate={{
          y: [0, -9, 0],
        }}
        whileHover={{
          scale: 1.04,
          y: -3,
        }}
        whileTap={{
          scale: 0.97,
        }}
        transition={{
          y: {
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="fixed right-5 bottom-6 z-50 flex items-center gap-3 rounded-full border border-white/20 bg-linear-to-r from-[#0f6cbd] via-[#2563eb] to-[#06b6d4] px-5 py-4 text-white shadow-[0_20px_60px_rgba(37,99,235,0.5)] ring-offset-2 transition outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:right-8 sm:bottom-8"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-blue-600 bg-emerald-400" />
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-xs text-blue-100">Copilot Studio</span>
          <span className="block font-bold">AI 폭염 상담</span>
        </span>
      </motion.button>

      <div
        className={`fixed right-5 bottom-28 z-50 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-xl shadow-2xl shadow-black/20 sm:right-8 sm:bottom-32 ${
          isChatOpen ? "" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <iframe
          src="https://copilotstudio.microsoft.com/environments/Default-a5a060c4-00b2-4343-b6c9-23625439a0c0/bots/cr9fa_v2_X0hS-b/webchat?__version__=2&enableFileAttachment=false&cliAgent=true"
          className="h-172 w-full rounded-xl border-0"
          title="Copilot Studio AI 폭염 상담"
        ></iframe>
      </div>
    </div>
  )
}

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#eff6ff_100%)]" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="absolute top-20 -right-32 h-120 w-120 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-128 w-lg rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.025]" />
    </div>
  )
}

function HeroSection({
  isLoading,
  temperature,
  humidity,
  hasHeatWarning,
  risk,
}: Readonly<{
  isLoading: boolean
  temperature: number | null
  humidity: number | null
  hasHeatWarning: boolean
  risk: RiskResult
}>) {
  return (
    <Card className="relative overflow-hidden border-white/15 bg-linear-to-br from-orange-500 via-red-500 to-rose-700 text-white shadow-[0_30px_100px_rgba(239,68,68,0.32)]">
      <div className="absolute -top-28 -right-20 h-80 w-80 rounded-full border-45 border-white/10" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

      <CardContent className="relative p-6 sm:p-9 lg:p-12">
        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 bg-white/20" />
              <Skeleton className="h-20 w-80 bg-white/20" />
              <Skeleton className="h-6 w-96 max-w-full bg-white/20" />
            </div>
            <Skeleton className="h-48 w-full rounded-3xl bg-white/20 lg:w-64" />
          </div>
        ) : (
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <Badge className="border-white/20 bg-white/15 text-white backdrop-blur hover:bg-white/15">
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {LOCATION_NAME}
              </Badge>

              <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2">
                <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                  {risk.label}
                </h2>

                <span className="pb-2 text-lg font-semibold text-orange-100">
                  폭염 위험도
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
                {hasHeatWarning
                  ? "현재 위치와 관련된 폭염 특보가 확인되었습니다. 불필요한 야외활동을 줄이고 시원한 장소를 이용하세요."
                  : risk.message}
              </p>
            </div>

            <div className="min-w-60 rounded-[2rem] border border-white/20 bg-white/15 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm text-orange-100">
                <span>현재 기온</span>
                <Thermometer className="h-5 w-5" />
              </div>

              <div className="mt-3 text-6xl font-black">
                {temperature ?? "-"}
                <span className="text-3xl">℃</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-sm">
                <span className="text-orange-100">상대습도</span>
                <span className="font-bold">
                  {humidity === null ? "-" : `${humidity}%`}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
  iconClassName,
  loading,
}: Readonly<{
  icon: ReactNode
  label: string
  value: string
  description: string
  accent: string
  iconClassName: string
  loading: boolean
}>) {
  return (
    <Card className="group overflow-hidden border-slate-200/70 bg-white/95 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className={`h-1.5 bg-linear-to-r ${accent}`} />

      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        ) : (
          <>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
            >
              {icon}
            </div>

            <p className="mt-5 text-sm font-medium text-muted-foreground">
              {label}
            </p>

            <p className="mt-1 text-3xl font-black tracking-tight">{value}</p>

            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function GuideCard({
  icon,
  title,
  description,
}: Readonly<{
  icon: string
  title: string
  description: string
}>) {
  return (
    <div className="group rounded-2xl border bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50">
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 font-bold">{title}</div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function CoolingShelterCard({
  shelter,
  index,
}: Readonly<{
  shelter: CoolingShelter
  index: number
}>) {
  const navigationUrl = createNavigationUrl(shelter)

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
      }}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white to-blue-50/40 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-950">{shelter.name}</h3>

              {index === 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  가장 가까움
                </Badge>
              )}

              <Badge variant="outline">{shelter.facilityType}</Badge>
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
              <span>{shelter.address}</span>
            </div>

            {shelter.detailPosition && (
              <p className="mt-1 pl-6 text-xs text-muted-foreground">
                {shelter.detailPosition}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-2xl font-black text-blue-700">
            {formatDistance(shelter.distanceKm)}
          </p>

          <p className="text-xs text-muted-foreground">직선거리</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <ShelterDetail
          icon={<Clock3 className="h-4 w-4" />}
          label="평일 운영"
          value={shelter.weekdayHours ?? "정보 없음"}
        />

        <ShelterDetail
          icon={<Users className="h-4 w-4" />}
          label="수용 인원"
          value={
            shelter.capacity !== null
              ? `${shelter.capacity.toLocaleString()}명`
              : "정보 없음"
          }
        />

        <ShelterDetail
          icon={<Snowflake className="h-4 w-4" />}
          label="냉방기"
          value={formatBooleanStatus(shelter.hasAirConditioner)}
        />

        <ShelterDetail
          icon={<Sun className="h-4 w-4" />}
          label="주말·공휴일"
          value={
            shelter.weekendHours ?? formatBooleanStatus(shelter.weekendOpen)
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {shelter.nightOpen === true && (
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
          >
            야간 운영
          </Badge>
        )}

        {shelter.weekendOpen === true && (
          <Badge
            variant="secondary"
            className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100"
          >
            주말·공휴일 운영
          </Badge>
        )}

        {shelter.stayAvailable === true && (
          <Badge
            variant="secondary"
            className="bg-violet-100 text-violet-700 hover:bg-violet-100"
          >
            숙박 가능
          </Badge>
        )}

        {shelter.hasAirConditioner === true && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            냉방기 보유
          </Badge>
        )}
      </div>

      {shelter.note && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <span className="font-semibold">안내: </span>
          {shelter.note}
        </div>
      )}

      <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
        <a href={navigationUrl} className={buttonVariants({ size: "sm" })}>
          <Navigation className="mr-2 h-4 w-4" />
          지도에서 보기
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </a>
      </div>
    </motion.article>
  )
}

function ShelterDetail({
  icon,
  label,
  value,
}: Readonly<{
  icon: ReactNode
  label: string
  value: string
}>) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>

        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

interface RiskResult {
  label: "LOW" | "MODERATE" | "HIGH" | "EXTREME"
  score: number
  message: string
  textColor: string
}

function calculateRisk({
  temperature,
  humidity,
  hasHeatWarning,
}: {
  temperature: number | null
  humidity: number | null
  hasHeatWarning: boolean
}): RiskResult {
  let score = 10

  if (temperature !== null) {
    if (temperature >= 37) score += 60
    else if (temperature >= 35) score += 50
    else if (temperature >= 33) score += 40
    else if (temperature >= 30) score += 25
    else score += 5
  }

  if (humidity !== null) {
    if (humidity >= 80) score += 20
    else if (humidity >= 65) score += 14
    else if (humidity >= 50) score += 8
  }

  if (hasHeatWarning) {
    score += 20
  }

  score = Math.min(100, score)

  if (score >= 90) {
    return {
      label: "EXTREME",
      score,
      message:
        "매우 위험한 폭염 환경일 수 있습니다. 외출을 피하고 냉방시설을 이용하세요.",
      textColor: "text-red-600",
    }
  }

  if (score >= 70) {
    return {
      label: "HIGH",
      score,
      message: "폭염 위험이 높습니다. 야외활동을 줄이고 물을 자주 마시세요.",
      textColor: "text-orange-600",
    }
  }

  if (score >= 40) {
    return {
      label: "MODERATE",
      score,
      message:
        "더위로 인한 불편이 발생할 수 있습니다. 장시간 야외활동에 주의하세요.",
      textColor: "text-amber-600",
    }
  }

  return {
    label: "LOW",
    score,
    message:
      "현재 계산된 위험은 낮지만 기상 변화와 개인 건강 상태를 확인하세요.",
    textColor: "text-emerald-600",
  }
}

function RiskBadge({ risk }: Readonly<{ risk: RiskResult }>) {
  const className = {
    LOW: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    MODERATE: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    HIGH: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    EXTREME: "bg-red-100 text-red-700 hover:bg-red-100",
  }[risk.label]

  return <Badge className={className}>{risk.label}</Badge>
}

function formatValue(value: number | null | undefined, unit: string) {
  return value === null || value === undefined ? "-" : `${value}${unit}`
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "알 수 없는 오류가 발생했습니다."
}

function formatWarningDateTime(value?: string) {
  if (!value || value.length < 12) {
    return "-"
  }

  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  const hour = value.slice(8, 10)
  const minute = value.slice(10, 12)

  return `${year}.${month}.${day} ${hour}:${minute} KST`
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }

  return `${distanceKm.toFixed(1)}km`
}

function formatBooleanStatus(value: boolean | null) {
  if (value === true) {
    return "가능"
  }

  if (value === false) {
    return "불가능"
  }

  return "정보 없음"
}

function createNavigationUrl(shelter: CoolingShelter) {
  const query = encodeURIComponent(
    shelter.address && shelter.address !== "주소 미제공"
      ? shelter.address
      : `${shelter.latitude},${shelter.longitude}`
  )

  return `https://map.kakao.com/link/search/${query}`
}
