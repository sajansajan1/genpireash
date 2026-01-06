import { type NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials, createAdminSession, setAdminSessionCookie } from "@/lib/admin-auth"

// Rate limiting (in-memory for simplicity)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Rate limiting
    const clientIP = request.ip || "unknown"
    const attempts = loginAttempts.get(clientIP)
    const now = Date.now()

    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60)
        return NextResponse.json(
          { error: `Too many login attempts. Try again in ${remainingTime} minutes.` },
          { status: 429 },
        )
      } else {
        // Reset attempts after lockout period
        loginAttempts.delete(clientIP)
      }
    }

    // Validate credentials
    if (!validateAdminCredentials(email, password)) {
      // Track failed attempt
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, {
        count: currentAttempts.count + 1,
        lastAttempt: now,
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(clientIP)

    // Create session
    const token = await createAdminSession(email)
    const response = NextResponse.json({ success: true })
    setAdminSessionCookie(response, token)

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
