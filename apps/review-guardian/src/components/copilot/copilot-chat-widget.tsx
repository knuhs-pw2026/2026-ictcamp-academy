import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { ChatFloatingButton } from "@/components/copilot/chat-floating-button"
import { CopilotChatPanel } from "@/components/copilot/copilot-chat-panel"

const PANEL_ID = "copilot-chat-panel"
const HEADING_ID = "copilot-chat-heading"
const SLOW_LOADING_DELAY_MS = 6000
const TRANSITION_LOCK_MS = 300
const MOBILE_BREAKPOINT_QUERY = "(max-width: 639px)"

interface CopilotChatContextValue {
  openChat: () => void
}

const CopilotChatContext = createContext<CopilotChatContextValue | null>(null)

export function useCopilotChat() {
  const context = useContext(CopilotChatContext)
  if (!context) {
    throw new Error("useCopilotChat must be used within CopilotChatProvider")
  }
  return context
}

export function CopilotChatProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isTransitioningRef = useRef(false)
  const slowLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lockTransition = useCallback(() => {
    isTransitioningRef.current = true
    unlockTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false
    }, TRANSITION_LOCK_MS)
  }, [])

  const openChat = useCallback(() => {
    if (isTransitioningRef.current) return
    lockTransition()
    setIsOpen(true)
  }, [lockTransition])

  const closeChat = useCallback(() => {
    if (isTransitioningRef.current) return
    lockTransition()
    setIsOpen(false)
  }, [lockTransition])

  const toggleChat = useCallback(() => {
    if (isTransitioningRef.current) return
    lockTransition()
    setIsOpen((prev) => !prev)
  }, [lockTransition])

  const handleIframeLoad = useCallback(() => {
    setIsIframeLoaded(true)
    setShowSlowLoadingHint(false)
    if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current)
  }, [])

  // Start the slow-loading timer once, from initial mount, since the
  // iframe preloads before the panel is ever opened.
  useEffect(() => {
    slowLoadTimerRef.current = setTimeout(() => {
      setShowSlowLoadingHint((current) => (isIframeLoaded ? current : true))
    }, SLOW_LOADING_DELAY_MS)

    return () => {
      if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [])

  // Escape key closes the panel.
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeChat()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeChat])

  // Focus management: move focus into the panel on open, restore it to the
  // trigger button on close.
  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus()
    } else {
      triggerRef.current?.focus()
    }
  }, [isOpen])

  // Lock background scroll on narrow (mobile, full-screen panel) viewports
  // only while the panel is open.
  useEffect(() => {
    if (typeof window === "undefined") return
    const isMobile = window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
    if (!isOpen || !isMobile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <CopilotChatContext.Provider value={{ openChat }}>
      {children}

      <CopilotChatPanel
        panelId={PANEL_ID}
        headingId={HEADING_ID}
        isOpen={isOpen}
        isIframeLoaded={isIframeLoaded}
        showSlowLoadingHint={showSlowLoadingHint}
        onClose={closeChat}
        onIframeLoad={handleIframeLoad}
        iframeRef={iframeRef}
        headingRef={headingRef}
      />

      <ChatFloatingButton
        ref={triggerRef}
        isOpen={isOpen}
        panelId={PANEL_ID}
        onClick={toggleChat}
      />
    </CopilotChatContext.Provider>
  )
}
