// Standalone script for direct embedding
;(() => {
  class AstraCaptcha {
    constructor(config) {
      this.config = config
      this.iframe = null
      this.setupMessageListener()
    }

    setupMessageListener() {
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

    render(containerId) {
      const container = document.getElementById(containerId)
      if (!container) {
        console.error("Container " + containerId + " not found")
        return
      }

      const iframe = document.createElement("iframe")
      const baseUrl = window.location.origin
      iframe.src =
        baseUrl + "/captcha/widget?siteKey=" + this.config.siteKey + "&theme=" + (this.config.theme || "dark")
      iframe.style.width = "100%"
      iframe.style.height = "280px"
      iframe.style.border = "none"
      iframe.style.borderRadius = "8px"
      iframe.title = "AstraCaph CAPTCHA"

      container.appendChild(iframe)
      this.iframe = iframe
    }

    reset() {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.location.reload()
      }
    }

    destroy() {
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe)
        this.iframe = null
      }
    }
  }

  // Auto-initialize elements with data-astra-captcha attribute
  function autoInit() {
    const elements = document.querySelectorAll("[data-astra-captcha]")
    elements.forEach((el) => {
      const siteKey = el.getAttribute("data-sitekey")
      const theme = el.getAttribute("data-theme") || "dark"

      if (siteKey) {
        const captcha = new AstraCaptcha({
          siteKey: siteKey,
          theme: theme,
        })
        captcha.render(el.id || "astra-captcha-" + Math.random().toString(36).substr(2, 9))
      }
    })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit)
  } else {
    autoInit()
  }

  window.AstraCaptcha = AstraCaptcha
})()
