import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { comparePassword, generateToken } from '@/lib/auth'

// Helper function to extract device and browser info from user agent
function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)
  
  let deviceType = 'Desktop'
  if (isTablet) deviceType = 'Tablet'
  else if (isMobile) deviceType = 'Mobile'
  
  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  else if (userAgent.includes('Opera')) browser = 'Opera'
  
  return { deviceType, browser }
}

// Helper function to get location from IP address
async function getLocationFromIP(ipAddress: string) {
  try {
    // Skip localhost/private IPs
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return 'Local Development'
    }

    // Use ip-api.com (free service, no API key required)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,regionName,city,status`)
    const data = await response.json()
    
    if (data.status === 'success') {
      const parts = []
      if (data.city) parts.push(data.city)
      if (data.regionName) parts.push(data.regionName)
      if (data.country) parts.push(data.country)
      return parts.join(', ') || 'Unknown'
    }
    
    return 'Unknown'
  } catch (error) {
    console.error('Failed to get location from IP:', error)
    return 'Unknown'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Extract request information for login history
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || '127.0.0.1'
    
    const { deviceType, browser } = parseUserAgent(userAgent)
    const location = await getLocationFromIP(ipAddress.trim())

    // Find user
    const result = await query(
      'SELECT id, password_hash, is_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      // Record failed login attempt
      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, location, status) 
         VALUES (NULL, $1, $2, $3, $4, $5, $6)`,
        [ipAddress, userAgent, deviceType, browser, location, 'failed']
      ).catch(err => console.error('Failed to log unsuccessful login:', err))

      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Check if email is verified
    if (!user.is_verified) {
      // Record failed login attempt
      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, ipAddress, userAgent, deviceType, browser, location, 'failed']
      ).catch(err => console.error('Failed to log unverified login:', err))

      return NextResponse.json(
        { message: 'Please verify your email before logging in' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      // Record failed login attempt
      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, ipAddress, userAgent, deviceType, browser, location, 'failed']
      ).catch(err => console.error('Failed to log invalid password:', err))

      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Record successful login
    await query(
      `INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, location, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, ipAddress, userAgent, deviceType, browser, location, 'success']
    ).catch(err => console.error('Failed to log successful login:', err))

    // Generate token
    const token = generateToken(user.id)

    // Note: AI onboarding is now triggered when user first opens the chat
    // This ensures the onboarding happens at the right time and context

    return NextResponse.json({
      message: 'Login successful',
      token,
      userId: user.id
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
