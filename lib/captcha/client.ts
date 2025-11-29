// Client-side SDK for easy integration

export interface AstraCaptchaConfig {
  siteKey: string
  theme?: "dark" | "light"
  onSuccess?: (token: string) => void
  onError?: (error: string) => void
}

export class AstraCaptcha {
  private config: AstraCaptchaConfig
  private iframe: HTMLIFrameElement | null = null

  constructor(config: AstraCaptchaConfig) {
    this.config = config
    this.setupMessageListener()
  }

  private setupMessageListener() {
    window.addEventListener("message", (event) => {
      if (event.data.type === "astra-captcha-result") {
        if (event.data.success && this.config.onSuccess) {
          this.config.onSuccess(event.data.token)
        } else if (!event.data.success && this.config.onError) {
          this.config.onError("Verification failed")
        }
      }
    })
  }

  render(containerId: string) {
    const container = document.getElementById(containerId)
    if (!container) {
      console.error(`Container ${containerId} not found`)
      return
    }

    const iframe = document.createElement("iframe")
    iframe.src = `/captcha/widget?siteKey=${this.config.siteKey}&theme=${this.config.theme || "dark"}`
    iframe.style.width = "100%"
    iframe.style.height = "280px"
    iframe.style.border = "none"
    iframe.style.borderRadius = "8px"
    iframe.title = "AstraCaph CAPTCHA"

    container.appendChild(iframe)
    this.iframe = iframe
  }

  reset() {
    if (this.iframe) {
      this.iframe.contentWindow?.location.reload()
    }
  }

  destroy() {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe)
      this.iframe = null
    }
  }
}

// Global API for script tag usage
if (typeof window !== "undefined") {
  ;(window as any).AstraCaptcha = AstraCaptcha
}
