# ALERA Backend Architecture

## Overview
The ALERA backend is built using Next.js API Routes with TypeScript, PostgreSQL database, and comprehensive middleware for authentication, authorization, and data processing. It provides a robust, scalable API for music artist management, revenue tracking, fan engagement, and AI-powered assistance.

## Technology Stack

### Core Backend
- **Next.js 15 API Routes** for serverless API endpoints
- **TypeScript** for type safety and developer experience
- **Node.js** runtime environment
- **PostgreSQL** with connection pooling for data persistence

### Authentication & Security
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcrypt** for password hashing (12 rounds)
- **Middleware** for route protection and admin access
- **Email verification** system with token generation

### Database & ORM
- **PostgreSQL** with native SQL queries
- **pg** connection pool for performance
- **Database migrations** for schema evolution
- **Comprehensive indexing** for query optimization

### External Services
- **OpenAI GPT-4** for AI agent functionality
- **Nodemailer** for email notifications
- **File upload processing** for revenue reports
- **IP geolocation** for login tracking

## API Architecture

### Route Structure
```
app/api/
├── auth/                          # Authentication endpoints
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── me/route.ts
│   ├── request-password-reset/route.ts
│   ├── reset-password/route.ts
│   ├── verify-email/route.ts
│   ├── resend-verification/route.ts
│   └── request-email-change/route.ts
├── admin/                         # Admin-only endpoints
│   ├── artists/route.ts
│   ├── releases/[id]/route.ts
│   ├── withdrawals/[id]/route.ts
│   ├── analytics-upload/route.ts
│   └── upload-history/route.ts
├── ai-agent/                      # AI chat system
│   ├── chat/route.ts
│   ├── chat-history/route.ts
│   ├── artist-context/route.ts
│   ├── trigger-onboarding/route.ts
│   └── notifications/
│       ├── dispatch/route.ts
│       ├── mark-read/route.ts
│       └── unread-count/route.ts
├── distribution/                  # Music distribution
│   └── releases/
│       ├── route.ts
│       └── [id]/route.ts
├── fanzone/                       # Fan management
│   ├── fans/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── campaigns/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/send/route.ts
│   ├── import/route.ts
│   └── insights/route.ts
├── wallet/                        # Financial management
│   ├── summary/route.ts
│   ├── history/route.ts
│   ├── withdrawals/route.ts
│   ├── request-withdrawal/route.ts
│   └── payout-method/route.ts
├── upload-revenue-report/route.ts # Revenue processing
├── files/[...path]/route.ts       # File serving
├── landing-page/[artistId]/route.ts # Public pages
└── public/                        # Public endpoints
    ├── fans/add/route.ts
    └── verify-paid/route.ts
```

## Core Libraries & Utilities

### Database Connection (`lib/db.ts`)
```typescript
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}
```

### Authentication (`lib/auth.ts`)
```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret'

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}
```

### Middleware (`lib/auth-middleware.ts`, `lib/admin-middleware.ts`)
```typescript
// Authentication middleware
export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided")
  }
  
  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    throw new Error("Invalid token")
  }
  
  return decoded.userId
}

// Admin middleware
export async function requireAdmin(request: NextRequest) {
  const userId = await requireAuth(request)
  
  const result = await pool.query("SELECT is_admin FROM users WHERE id = $1", [userId])
  if (result.rows.length === 0 || !result.rows[0].is_admin) {
    throw new Error("Admin access required")
  }
  
  return userId
}
```

## API Endpoint Details

### Authentication Endpoints

#### User Registration (`/api/auth/register`)
```typescript
export async function POST(request: NextRequest) {
  const { email, password, artistName } = await request.json()
  
  // Validate input
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }
  
  // Check for existing user
  const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])
  if (existingUser.rows.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 })
  }
  
  // Hash password and create user
  const passwordHash = await hashPassword(password)
  const verificationToken = generateRandomToken()
  
  const result = await query(
    `INSERT INTO users (email, password_hash, artist_name, verification_token)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [email, passwordHash, artistName || null, verificationToken]
  )
  
  // Send verification email
  await sendVerificationEmail(email, verificationToken)
  
  return NextResponse.json({ message: "Registration successful" })
}
```

#### User Login (`/api/auth/login`)
```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Extract device info for login tracking
  const userAgent = request.headers.get('user-agent') || ''
  const ipAddress = getClientIP(request)
  const { deviceType, browser } = parseUserAgent(userAgent)
  const location = await getLocationFromIP(ipAddress)
  
  // Find and verify user
  const result = await query(
    'SELECT id, password_hash, is_verified FROM users WHERE email = $1',
    [email]
  )
  
  if (result.rows.length === 0) {
    await logLoginAttempt(null, ipAddress, userAgent, deviceType, browser, location, 'failed')
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }
  
  const user = result.rows[0]
  
  // Verify password
  const isValidPassword = await comparePassword(password, user.password_hash)
  if (!isValidPassword) {
    await logLoginAttempt(user.id, ipAddress, userAgent, deviceType, browser, location, 'failed')
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }
  
  // Record successful login
  await logLoginAttempt(user.id, ipAddress, userAgent, deviceType, browser, location, 'success')
  
  // Generate token
  const token = generateToken(user.id)
  
  return NextResponse.json({ message: 'Login successful', token, userId: user.id })
}
```

### Revenue Management

#### Revenue Report Upload (`/api/upload-revenue-report`)
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const artistId = formData.get('artist_id') as string
  
  // Validate file
  if (!file.name.endsWith('.tsv') && !file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'File must be a .tsv or .csv file' }, { status: 400 })
  }
  
  const content = await file.text()
  const lines = content.split(/\r?\n|\r/).filter(line => line.trim() !== '')
  
  // Parse headers and detect columns
  const delimiter = file.name.endsWith('.tsv') ? '\t' : ','
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
  
  const columnIndices = {
    reportingMonth: findColumnIndex(['reporting date']),
    saleMonth: findColumnIndex(['sale month']),
    store: findColumnIndex(['store']),
    artist: findColumnIndex(['artist']),
    title: findColumnIndex(['title']),
    earnings: findColumnIndex(['earnings (usd)'])
  }
  
  // Process data in batches
  const batchSize = 100
  const processed = []
  const errors = []
  
  for (let batchStart = 1; batchStart < lines.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, lines.length)
    const batchData = []
    
    for (let i = batchStart; i < batchEnd; i++) {
      const row = lines[i].split(delimiter).map(cell => cell.trim())
      
      try {
        const saleMonth = row[columnIndices.saleMonth]
        const store = row[columnIndices.store]
        const earnings = parseFloat(row[columnIndices.earnings] || '0')
        
        // Process and validate data
        const processedRow = processRevenueRow(row, columnIndices, headers)
        batchData.push(processedRow)
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }
    
    // Batch insert
    if (batchData.length > 0) {
      await insertBatchData(batchData, artistId)
      processed.push(...batchData)
    }
  }
  
  // Record upload history
  await recordUploadHistory(artistId, file.name, processed.length, errors.length)
  
  return NextResponse.json({
    message: `File processed successfully. ${processed.length} records processed.`,
    processed: processed.length,
    errors: errors.length > 0 ? errors : undefined
  })
}
```

### AI Agent System

#### Chat Endpoint (`/api/ai-agent/chat`)
```typescript
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1]
  const decoded = verifyToken(token)
  
  const body = await request.json()
  const message: string = body?.message
  
  // Get artist context and chat history
  const [chatHistory, artistContext, onboardingStatus] = await Promise.all([
    fetchChatHistory(decoded.userId, 10),
    fetchArtistContext(decoded.userId),
    checkOnboardingStatus(decoded.userId)
  ])
  
  // Handle onboarding flow
  if (!onboardingStatus || !onboardingStatus.is_completed) {
    return handleOnboardingFlow(decoded.userId, message, onboardingStatus)
  }
  
  // Fetch comprehensive data for AI context
  const [walletData, analyticsData, releasesData, fansData, landingPageData] = await Promise.all([
    fetchWalletData(decoded.userId),
    fetchAnalyticsData(decoded.userId),
    fetchReleasesData(decoded.userId),
    fetchFansData(decoded.userId),
    fetchLandingPageData(decoded.userId)
  ])
  
  const allData = { walletData, analyticsData, releasesData, fansData, landingPageData }
  
  // Generate AI response
  const response = await generateAIResponse('general', allData, message, artistName, chatHistory, artistContext)
  
  // Save messages
  await saveChatMessage(decoded.userId, message, true, 'general')
  await saveChatMessage(decoded.userId, response, false, 'general', allData)
  
  return NextResponse.json({ response })
}
```

#### AI Response Generation
```typescript
async function generateAIResponse(intent: string, data: any, message: string, artistName: string, chatHistory: any[], artistContext: any) {
  const context = buildAIContext(artistName, data, artistContext, message)
  
  const messages = [
    { role: "system", content: context },
    ...chatHistory.slice(-5).map(msg => ({
      role: msg.is_user_message ? "user" : "assistant",
      content: msg.message_text
    })),
    { role: "user", content: `Current question: ${message}` }
  ]
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 400,
    temperature: 0.7,
  })
  
  return formatAssistantHtml(completion.choices[0]?.message?.content || "")
}
```

### Music Distribution

#### Release Creation (`/api/distribution/releases`)
```typescript
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  const decoded = verifyToken(token)
  
  const data = await request.json()
  const {
    distribution_type, artist_name, release_title, tracks,
    submit_for_review, terms_agreed, // ... other fields
  } = data
  
  // Validate required fields
  if (!distribution_type || !artist_name || !release_title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  
  // Validate track count based on distribution type
  const trackCount = tracks?.length || 0
  if (distribution_type === 'Single' && trackCount !== 1) {
    return NextResponse.json({ error: 'Single must have exactly 1 track' }, { status: 400 })
  }
  
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Insert release
    const releaseResult = await client.query(`
      INSERT INTO releases (
        artist_id, distribution_type, artist_name, release_title,
        status, terms_agreed, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      decoded.userId, distribution_type, artist_name, release_title,
      submit_for_review ? 'under_review' : 'draft', terms_agreed,
      submit_for_review ? new Date() : null
    ])
    
    const release = releaseResult.rows[0]
    
    // Insert tracks
    if (tracks && tracks.length > 0) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        await client.query(`
          INSERT INTO tracks (
            release_id, track_number, track_title, artist_names,
            featured_artists, songwriters, producer_credits,
            performer_credits, genre, audio_file_url, audio_file_name,
            isrc, lyrics_text, has_lyrics
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          release.id, i + 1, track.track_title, track.artist_names || [],
          track.featured_artists || [], JSON.stringify(track.songwriters || []),
          JSON.stringify(track.producer_credits || []), JSON.stringify(track.performer_credits || []),
          track.genre, track.audio_file_url, track.audio_file_name,
          track.isrc, track.lyrics_text, track.has_lyrics || false
        ])
      }
    }
    
    await client.query('COMMIT')
    
    return NextResponse.json({
      message: submit_for_review ? 'Release submitted for review successfully' : 'Release saved as draft',
      release
    })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
```

### Fan Management

#### Fan CRUD Operations (`/api/fanzone/fans`)
```typescript
// GET - List fans with pagination and filtering
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || 'all'
  
  const offset = (page - 1) * limit
  
  let whereClause = 'WHERE artist_id = $1'
  let queryParams: any[] = [decoded.userId]
  let paramCount = 1
  
  if (search) {
    paramCount++
    whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
    queryParams.push(`%${search}%`)
  }
  
  if (filter !== 'all') {
    paramCount++
    whereClause += ` AND subscribed_status = $${paramCount}`
    queryParams.push(filter)
  }
  
  const fansQuery = `
    SELECT id, name, email, phone_number, country, gender, age, birth_year, 
           subscribed_status, source, created_at
    FROM fans 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `
  queryParams.push(limit, offset)
  
  const fansResult = await pool.query(fansQuery, queryParams)
  
  return NextResponse.json({
    fans: fansResult.rows,
    pagination: {
      page, limit, total: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  })
}

// POST - Create new fan
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  
  const { name, email, phone_number, country, gender, age, birth_year, subscribed_status, source } = await request.json()
  
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }
  
  // Check for existing fan
  const existingFan = await pool.query(
    'SELECT id FROM fans WHERE artist_id = $1 AND email = $2',
    [decoded.userId, email]
  )
  
  if (existingFan.rows.length > 0) {
    return NextResponse.json({ error: 'Fan with this email already exists' }, { status: 409 })
  }
  
  const result = await pool.query(`
    INSERT INTO fans (artist_id, name, email, phone_number, country, gender, age, birth_year, subscribed_status, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [decoded.userId, name, email, phone_number, country, gender, age, birth_year, subscribed_status || 'free', source || 'manual'])
  
  return NextResponse.json({ fan: result.rows[0] })
}
```

### Wallet & Financial Management

#### Wallet Summary (`/api/wallet/summary`)
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artistId = searchParams.get('artist_id')
  const range = searchParams.get('range') || '30days'
  
  // Calculate date range
  let dateFilter = ''
  const now = new Date()
  let startDate: Date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  switch (range) {
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'alltime':
      dateFilter = ''
      break
  }
  
  if (range !== 'alltime') {
    dateFilter = `AND reporting_month >= '${startDate.toISOString().split('T')[0]}'`
  }
  
  // Get earnings data
  const [totalResult, platformResult, withdrawnResult, pendingWithdrawalsResult] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(amount_usd), 0) as total_earnings FROM streaming_earnings WHERE artist_id = $1 ${dateFilter}`, [artistId]),
    pool.query(`SELECT platform, ROUND(SUM(amount_usd)::numeric, 2) as amount FROM streaming_earnings WHERE artist_id = $1 ${dateFilter} GROUP BY platform ORDER BY amount DESC`, [artistId]),
    pool.query(`SELECT COALESCE(SUM(amount_requested), 0) as withdrawn FROM withdrawal_requests WHERE artist_id = $1 AND status IN ('completed', 'approved')`, [artistId]),
    pool.query(`SELECT COALESCE(SUM(amount_requested), 0) as pending_withdrawals FROM withdrawal_requests WHERE artist_id = $1 AND status = 'pending'`, [artistId])
  ])
  
  const totalEarnings = Number(totalResult.rows[0].total_earnings)
  const totalWithdrawn = Number(withdrawnResult.rows[0].withdrawn)
  const pendingWithdrawals = Number(pendingWithdrawalsResult.rows[0].pending_withdrawals)
  const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals
  
  return NextResponse.json({
    filter_range: range,
    all_time_earnings: totalEarnings,
    total_withdrawn: totalWithdrawn,
    available_balance: Math.max(0, availableBalance),
    earnings_by_platform: platformResult.rows
  })
}
```

## Database Schema & Migrations

### Migration System
- **24 migration files** for progressive schema evolution
- **Sequential numbering** for ordered execution
- **Rollback support** with transaction safety
- **Index optimization** for query performance

### Key Schema Features
```sql
-- Users table with admin support
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streaming earnings with flexible schema
CREATE TABLE streaming_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  reporting_month DATE,
  sale_month DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  artist VARCHAR(255),
  title VARCHAR(255),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  quantity INTEGER,
  team_percentage DECIMAL(5,2),
  song_album VARCHAR(255),
  country_of_sale VARCHAR(100),
  songwriter_royalties_withheld DECIMAL(10,2),
  amount_usd DECIMAL(10,2) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive indexing
CREATE INDEX idx_streaming_earnings_artist_date ON streaming_earnings(artist_id, sale_month);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin ON users(is_admin);
```

## Security Implementation

### Authentication Security
- **JWT tokens** with 7-day expiration
- **bcrypt hashing** with 12 rounds
- **Email verification** required for login
- **Password reset** with time-limited tokens
- **Login attempt tracking** with device/location logging

### Authorization
- **Role-based access** (user/admin)
- **Route protection** middleware
- **Admin-only endpoints** with verification
- **User data isolation** with proper WHERE clauses

### Data Validation
- **Input sanitization** for all endpoints
- **File type validation** for uploads
- **SQL injection prevention** with parameterized queries
- **XSS protection** with proper escaping

## Performance Optimizations

### Database Performance
- **Connection pooling** with pg
- **Comprehensive indexing** on frequently queried columns
- **Batch processing** for large data operations
- **Query optimization** with proper JOINs and WHERE clauses

### API Performance
- **Parallel data fetching** with Promise.all
- **Batch operations** for bulk inserts
- **Caching strategies** for frequently accessed data
- **Error handling** with proper HTTP status codes

### File Processing
- **Streaming file processing** for large uploads
- **Batch validation** with error reporting
- **Memory-efficient** parsing for TSV/CSV files
- **Progress tracking** for long-running operations

## Error Handling & Logging

### Error Response Patterns
```typescript
// Standard error response
return NextResponse.json(
  { error: 'Descriptive error message' },
  { status: 400 }
)

// Validation errors
return NextResponse.json(
  { error: 'Validation failed', details: validationErrors },
  { status: 422 }
)

// Authentication errors
return NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }
)
```

### Logging Strategy
- **Console logging** for development
- **Error tracking** with stack traces
- **Performance monitoring** for slow queries
- **Security logging** for failed authentication attempts

## External Service Integration

### OpenAI Integration
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Error handling for API failures
try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 400,
    temperature: 0.7,
  })
  return completion.choices[0]?.message?.content || ""
} catch (error) {
  console.error('OpenAI API error:', error)
  return "I'm having trouble connecting right now. Please try again later."
}
```

### Email Service
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  // Email configuration
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your ALERA account',
    html: `Click <a href="${verificationUrl}">here</a> to verify your account.`
  })
}
```

## Deployment & Environment

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
EMAIL_FROM=noreply@your-domain.com
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@your-domain.com
EMAIL_PASS=your-email-password
```

### Vercel Configuration
```json
{
  "crons": [
    {
      "path": "/api/ai-agent/notifications/dispatch",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This backend architecture provides a robust, scalable foundation for the ALERA platform with comprehensive security, performance optimization, and maintainable code structure.
