import type { NextRequest } from "next/server"
import { verifyToken } from "./auth"
import { pool } from "./db"

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided")
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    throw new Error("Invalid token")
  }

  // Check if user is admin
  const result = await pool.query("SELECT is_admin FROM users WHERE id = $1", [decoded.userId])

  if (result.rows.length === 0) {
    throw new Error("User not found")
  }

  if (!result.rows[0].is_admin) {
    throw new Error("Admin access required")
  }

  return decoded.userId
}

export async function verifyAdminToken(request: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return null
  }

  // Check if user is admin
  const result = await pool.query("SELECT is_admin FROM users WHERE id = $1", [decoded.userId])

  if (result.rows.length === 0) {
    return null
  }

  if (!result.rows[0].is_admin) {
    return null
  }

  return { userId: decoded.userId }
}
