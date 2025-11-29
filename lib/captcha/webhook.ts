// Webhook system for notifying external services

interface WebhookEvent {
  type: "verification" | "bot_detected" | "rate_limit" | "error"
  timestamp: number
  data: any
}

export class WebhookService {
  private webhooks: Map<string, string[]> = new Map()

  registerWebhook(siteKey: string, url: string) {
    const existing = this.webhooks.get(siteKey) || []
    if (!existing.includes(url)) {
      existing.push(url)
      this.webhooks.set(siteKey, existing)
    }
  }

  async triggerWebhook(siteKey: string, event: WebhookEvent) {
    const urls = this.webhooks.get(siteKey)
    if (!urls || urls.length === 0) return

    const promises = urls.map((url) =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AstraCaph-Webhook/1.0",
        },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error(`[v0] Webhook error for ${url}:`, error)
      }),
    )

    await Promise.allSettled(promises)
  }
}

export const webhookService = new WebhookService()
