
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const billingQuery = `
      SELECT 
        id,
        transaction_date,
        amount,
        transaction_type,
        status,
        description,
        reference_id,
        payment_method
      FROM billing_history 
      WHERE user_id = $1 
      ORDER BY transaction_date DESC
      LIMIT 50
    `
    
    const result = await query(billingQuery, [decoded.userId])

    return NextResponse.json({ 
      billing_history: result.rows 
    })
  } catch (error) {
    console.error("Billing history fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 }
    )
  }
}
