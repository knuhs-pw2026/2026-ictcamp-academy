import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { CopilotChatProvider } from "@/components/copilot/copilot-chat-widget"
import { AppHeader } from "@/components/sections/app-header"
import { AppFooter } from "@/components/sections/app-footer"
import { TooltipProvider } from "@/components/ui/tooltip"

function RootLayout() {
  return (
    <TooltipProvider>
      <CopilotChatProvider>
        <main className="min-h-dvh">
          <AppHeader />
          <Outlet />
          <AppFooter />
        </main>
      </CopilotChatProvider>

      <TanStackRouterDevtools />
    </TooltipProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
