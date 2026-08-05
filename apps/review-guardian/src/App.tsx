import { CopilotChatProvider } from "@/components/copilot/copilot-chat-widget"
import { AppHeader } from "@/components/sections/app-header"
import { HeroSection } from "@/components/sections/hero-section"
import { FeatureSection } from "@/components/sections/feature-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCtaSection } from "@/components/sections/final-cta-section"
import { AppFooter } from "@/components/sections/app-footer"

function App() {
  return (
    <CopilotChatProvider>
      <div className="min-h-dvh">
        <AppHeader />
        <main>
          <HeroSection />
          <FeatureSection />
          <HowItWorksSection />
          <TrustSection />
          <FinalCtaSection />
        </main>
        <AppFooter />
      </div>
    </CopilotChatProvider>
  )
}

export default App
