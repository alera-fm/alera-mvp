import { type NextRequest, NextResponse } from "next/server"
import { query, initDB } from "@/lib/db"
import { hashPassword, generateRandomToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await initDB()

    const { email, password, artistName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and generate verification token
    const passwordHash = await hashPassword(password)
    const verificationToken = generateRandomToken()

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, artist_name, verification_token)
       VALUES ($1, $2, $3, $4) RETURNING id, verification_token`,
      [email, passwordHash, artistName || null, verificationToken],
    )

    const userId = result.rows[0].id
    console.log("User created with verification token:", result.rows[0].verification_token)

    // Note: AI onboarding will be triggered when user first opens the chat

    // Verify the token was saved by querying it back
    const verifyTokenSaved = await query("SELECT verification_token FROM users WHERE id = $1", [userId])
    console.log("Token in database:", verifyTokenSaved.rows[0]?.verification_token)

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
      userId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
