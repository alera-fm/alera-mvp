import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userQuery = `
      SELECT 
        id, 
        email, 
        artist_name,
        phone_number, 
        country, 
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        company_name, 
        tax_id,
        business_email,
        business_phone,
        business_address_line_1,
        business_address_line_2,
        business_city,
        business_state_province,
        business_postal_code,
        business_country,
        created_at
      FROM users 
      WHERE id = $1
    `;
    const result = await query(userQuery, [decoded.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      artist_name,
      phone_number,
      country,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      company_name,
      tax_id,
      business_email,
      business_phone,
      business_address_line_1,
      business_address_line_2,
      business_city,
      business_state_province,
      business_postal_code,
      business_country,
    } = body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user is trying to change email by comparing with current email
    if (email) {
      const currentUserQuery = "SELECT email FROM users WHERE id = $1";
      const currentUserResult = await query(currentUserQuery, [decoded.userId]);

      if (currentUserResult.rows.length > 0) {
        const currentEmail = currentUserResult.rows[0].email;

        // Only require verification if email is actually changing
        if (email !== currentEmail) {
          return NextResponse.json(
            {
              error:
                "Email changes require verification. Please use the email verification endpoint.",
              require_email_verification: true,
            },
            { status: 400 }
          );
        }
      }
    }

    const updateQuery = `
      UPDATE users 
      SET 
        artist_name = COALESCE($1, artist_name),
        phone_number = $2,
        country = $3,
        address_line_1 = $4,
        address_line_2 = $5,
        city = $6,
        state_province = $7,
        postal_code = $8,
        company_name = $9,
        tax_id = $10,
        business_email = $11,
        business_phone = $12,
        business_address_line_1 = $13,
        business_address_line_2 = $14,
        business_city = $15,
        business_state_province = $16,
        business_postal_code = $17,
        business_country = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING id, email, artist_name, phone_number, country, address_line_1, address_line_2, city, state_province, postal_code, company_name, tax_id, business_email, business_phone, business_address_line_1, business_address_line_2, business_city, business_state_province, business_postal_code, business_country
    `;

    const result = await query(updateQuery, [
      artist_name,
      phone_number,
      country,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      company_name,
      tax_id,
      business_email,
      business_phone,
      business_address_line_1,
      business_address_line_2,
      business_city,
      business_state_province,
      business_postal_code,
      business_country,
      decoded.userId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
