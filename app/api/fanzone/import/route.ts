
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    const expectedHeaders = ['name', 'email', 'phone_number', 'country', 'gender', 'age', 'birth_year', 'subscribed_status', 'source']
    
    // Validate required headers
    if (!headers.includes('name') || !headers.includes('email')) {
      return NextResponse.json({ error: 'CSV must include at least "name" and "email" columns' }, { status: 400 })
    }

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      results.total++
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
      
      if (values.length !== headers.length) {
        results.failed++
        results.errors.push(`Row ${i + 1}: Column count mismatch`)
        continue
      }

      const fanData: any = {}
      headers.forEach((header, index) => {
        if (expectedHeaders.includes(header)) {
          fanData[header] = values[index] || null
        }
      })

      // Validate required fields
      if (!fanData.name || !fanData.email) {
        results.failed++
        results.errors.push(`Row ${i + 1}: Missing name or email`)
        continue
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(fanData.email)) {
        results.failed++
        results.errors.push(`Row ${i + 1}: Invalid email format`)
        continue
      }

      try {
        // Check if fan already exists
        const existingFan = await pool.query(
          'SELECT id FROM fans WHERE artist_id = $1 AND email = $2',
          [artistId, fanData.email]
        )

        if (existingFan.rows.length > 0) {
          results.failed++
          results.errors.push(`Row ${i + 1}: Fan with email ${fanData.email} already exists`)
          continue
        }

        // Convert numeric fields
        const age = fanData.age ? parseInt(fanData.age) : null
        const birthYear = fanData.birth_year ? parseInt(fanData.birth_year) : null

        // Insert fan
        await pool.query(`
          INSERT INTO fans (artist_id, name, email, phone_number, country, gender, age, birth_year, subscribed_status, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          artistId,
          fanData.name,
          fanData.email,
          fanData.phone_number,
          fanData.country,
          fanData.gender,
          age,
          birthYear,
          fanData.subscribed_status || 'free',
          fanData.source || 'import'
        ])

        results.successful++
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i + 1}: Database error - ${error.message}`)
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results
    })
  } catch (error) {
    console.error('Import fans error:', error)
    return NextResponse.json({ error: 'Failed to import fans' }, { status: 500 })
  }
}
