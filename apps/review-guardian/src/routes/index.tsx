import { Fragment } from "react"

import { createFileRoute } from "@tanstack/react-router"

import { HeroSection } from "@/components/sections/hero-section"
import { FeatureSection } from "@/components/sections/feature-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCtaSection } from "@/components/sections/final-cta-section"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Fragment>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <TrustSection />
      <FinalCtaSection />
    </Fragment>
  )
}
