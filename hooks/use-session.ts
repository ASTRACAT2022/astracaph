"use client"

import { useState, useEffect } from "react"

interface Session {
  token: string
  siteKey: string
  user: {
    id: string
    email: string
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem("astra-session")
      if (sessionData) {
        setSession(JSON.parse(sessionData))
      }
    } catch (error) {
      console.error("Failed to parse session data from localStorage", error)
    }
  }, [])

  return { session }
}
