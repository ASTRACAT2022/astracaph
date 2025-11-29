export interface CaptchaChallenge {
  token: string
  type: "drag" | "puzzle" | "fallback"
  data: {
    targetX?: number
    targetY?: number
    rotation?: number
    question?: string
  }
  expiresAt: number
}

export interface CaptchaVerificationRequest {
  token: string
  secretKey: string
  userResponse: {
    interactionTime: number
    mouseMovements: number
    timings: number[]
    canvasFingerprint: string
    webglFingerprint: string
    answer?: any
  }
}

export interface CaptchaVerificationResponse {
  success: boolean
  score: number
  bot: boolean
  details: {
    reasons: string[]
    timestamp: number
  }
}
