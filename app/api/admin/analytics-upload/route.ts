
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

// Platform-specific column mappings - ALL columns must be present for validation
const PLATFORM_COLUMN_MAPPINGS = {
  // Streaming Platforms (unified schema)
  'Deezer': {
    type: 'streaming',
    allColumns: ['Date', 'Song Name', 'ISRC', 'Service', 'Label', 'Artist Name', 'Country', 'Streams', 'Source',  'Device Type'],
    mappings: {
      date: 'Date',
      track_name: 'Song Name',
      artist_name: 'Artist Name',
      isrc: 'ISRC',
      country: 'Country',
      streams: 'Streams',
      device_type: 'Device Type',
      source: 'Source'
    }
  },
  'Apple Music': {
    type: 'streaming',
    allColumns: ['Date', 'Song Title', 'Artist', 'ISRC', 'Country', 'Device Type', 'Source of Stream', 'Stream Count'],
    mappings: {
      date: 'Date',
      track_name: 'Song Title',
      artist_name: 'Artist',
      isrc: 'ISRC',
      country: 'Country',
      streams: 'Stream Count',
      device_type: 'Device Type',
      source: 'Source of Stream'
    }
  },
  'Spotify': {
    type: 'streaming',
    allColumns: ['ISRC', 'Artist Name', 'Streams', 'Date', 'Song Name', 'Country', 'Source', 'Device Type'],
    mappings: {
      date: 'Date',
      track_name: 'Song Name',
      artist_name: 'Artist Name',
      isrc: 'ISRC',
      country: 'Country',
      streams: 'Streams',
      device_type: 'Device Type',
      source: 'Source'
    }
  },
  // Social Media Platforms (separate schemas)
  'Meta': {
    type: 'meta',
    allColumns: ['Service', 'Product Type', 'ISRC', 'UPC', 'Song Title', 'Artist', 'Event Count', 'Territory'],
    mappings: {
      track_name: 'Song Title',
      artist_name: 'Artist',
      isrc: 'ISRC',
      upc: 'UPC',
      service: 'Service',
      product_type: 'Product Type',
      event_count: 'Event Count',
      territory: 'Territory'
    }
  },
  'Shazam': {
    type: 'shazam',
    allColumns: ['Track Title', 'Artist', 'Country', 'State', 'City', 'ISRC', 'Shazam Count'],
    mappings: {
      track_name: 'Track Title',
      artist_name: 'Artist',
      isrc: 'ISRC',
      country: 'Country',
      state: 'State',
      city: 'City',
      shazam_count: 'Shazam Count'
    }
  },
  'TikTok': {
    type: 'tiktok',
    allColumns: ['Platform Name', 'Song ID', 'ISRC', 'UPC', 'Song Title', 'Artist', 'Platform Classified Genre', 'Territory', 'Content Type', 'Creations', 'Video Views', 'Comments', 'Likes', 'Shares', 'Favorites', 'Average Watchtime'],
    mappings: {
      track_name: 'Song Title',
      artist_name: 'Artist',
      isrc: 'ISRC',
      upc: 'UPC',
      platform_name: 'Platform Name',
      song_id: 'Song ID',
      platform_classified_genre: 'Platform Classified Genre',
      territory: 'Territory',
      content_type: 'Content Type',
      creations: 'Creations',
      video_views: 'Video Views',
      comments: 'Comments',
      likes: 'Likes',
      shares: 'Shares',
      favorites: 'Favorites',
      average_watchtime: 'Average Watchtime'
    }
  }
}

function parseCSVRow(line: string): string[] {
  // First, try to detect if it's tab-separated or comma-separated
  const commaCount = (line.match(/,/g) || []).length
  const tabCount = (line.match(/\t/g) || []).length
  
  let delimiter = ','
  if (tabCount > commaCount) {
    delimiter = '\t'
  }
  
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function getColumnValue(rowData: any, platformMapping: any, columnKey: string): string | null {
  const columnName = platformMapping.mappings[columnKey]
  if (!columnName) return null
  
  const value = rowData[columnName]
  return value ? value.trim() : null
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const userQuery = 'SELECT is_admin FROM users WHERE id = $1'
    const userResult = await query(userQuery, [decoded.userId])
    if (!userResult.rows[0] || !userResult.rows[0].is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const platform = formData.get('platform') as string
    const reportingDate = formData.get('reporting_date') as string

    if (!file || !platform || !reportingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if platform mapping exists
    const platformMapping = PLATFORM_COLUMN_MAPPINGS[platform as keyof typeof PLATFORM_COLUMN_MAPPINGS]
    if (!platformMapping) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain at least a header and one data row' }, { status: 400 })
    }

    // Parse headers and validate required columns
    const headers = parseCSVRow(lines[0])
    const requiredColumns = platformMapping.allColumns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    // Debug logging
    console.log('Platform:', platform)
    console.log('Detected headers:', headers)
    console.log('Required columns:', requiredColumns)
    console.log('Missing columns:', missingColumns)
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns for ${platform}: ${missingColumns.join(', ')}`,
        debug: {
          detectedHeaders: headers,
          requiredColumns: requiredColumns,
          missingColumns: missingColumns
        }
      }, { status: 400 })
    }

    let recordsProcessed = 0
    let skippedRecords = 0

    // Create upload record first to obtain upload_id
    const createUploadQuery = `
      INSERT INTO analytics_uploads (filename, platform, reporting_date, total_records, uploaded_by)
      VALUES ($1, $2, $3, 0, $4)
      RETURNING id
    `
    const createUploadResult = await query(createUploadQuery, [file.name, platform, reportingDate, decoded.userId])
    const uploadId = createUploadResult.rows[0].id

    // Process each line of the CSV
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVRow(lines[i])
      
      if (values.length !== headers.length) {
        skippedRecords++
        continue
      }

      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index]
      })

      // Extract data based on platform mapping
      const artistName = getColumnValue(rowData, platformMapping, 'artist_name')
      const trackName = getColumnValue(rowData, platformMapping, 'track_name')
      const isrc = getColumnValue(rowData, platformMapping, 'isrc')

      if (!artistName || !trackName) {
        skippedRecords++
        continue
      }

      // Find artist by name (case insensitive)
      const artistQuery = `
        SELECT id FROM users 
        WHERE LOWER(artist_name) = LOWER($1)
        LIMIT 1
      `
      const artistResult = await query(artistQuery, [artistName])
      
      if (artistResult.rows.length === 0) {
        skippedRecords++
        continue
      }

      const artistId = artistResult.rows[0].id

      // Try to find matching track in releases (try both track name and ISRC)
      let releaseId = null
      
      // First try to match by ISRC if available
      if (isrc) {
        const isrcQuery = `
          SELECT t.release_id FROM tracks t 
          JOIN releases r ON t.release_id = r.id
          WHERE r.artist_id = $1 AND t.isrc = $2
          LIMIT 1
        `
        const isrcResult = await query(isrcQuery, [artistId, isrc])
        if (isrcResult.rows.length > 0) {
          releaseId = isrcResult.rows[0].release_id
        }
      }

      // If no ISRC match, try track name
      if (!releaseId) {
        const trackQuery = `
          SELECT t.release_id FROM tracks t 
          JOIN releases r ON t.release_id = r.id
          WHERE r.artist_id = $1 AND LOWER(t.track_title) = LOWER($2)
          LIMIT 1
        `
        const trackResult = await query(trackQuery, [artistId, trackName])
        releaseId = trackResult.rows[0]?.release_id || null
      }

      // Process data based on platform type
      const platformType = platformMapping.type
      
      if (platformType === 'streaming') {
        // Handle streaming platforms (Spotify, Apple Music, Deezer)
        const country = getColumnValue(rowData, platformMapping, 'country')
        const deviceType = getColumnValue(rowData, platformMapping, 'device_type')
        const source = getColumnValue(rowData, platformMapping, 'source')
        
        // Robust numeric parsing for stream counts (handles values like "3,201" or "3201 ")
        const rawStreams = getColumnValue(rowData, platformMapping, 'streams') || '0'
        const sanitizedStreams = rawStreams.replace(/[^0-9-\.]/g, '')
        let streams = parseInt(sanitizedStreams, 10)
        if (Number.isNaN(streams)) {
          streams = 0
        }

        // Use reporting date from form, or try to extract from CSV
        let finalReportingDate = reportingDate
        const csvDate = getColumnValue(rowData, platformMapping, 'date')
        if (csvDate) {
          const parsedDate = new Date(csvDate)
          if (!isNaN(parsedDate.getTime())) {
            finalReportingDate = parsedDate.toISOString().split('T')[0]
          }
        }

        // Manual UPSERT to avoid dependency on a named unique constraint
        const countryCode = country ? country.trim().substring(0, 2).toUpperCase() : ''
        const normalizedDeviceType = deviceType || ''
        const normalizedSource = source || ''

        const updateQuery = `
          UPDATE streaming_analytics
          SET streams = streams + $5, updated_at = CURRENT_TIMESTAMP
          WHERE artist_id = $1
            AND song_title = $2
            AND platform = $3
            AND date = $4
            AND COALESCE(country, '') = COALESCE($6, '')
            AND COALESCE(device_type, '') = COALESCE($7, '')
            AND COALESCE(source, '') = COALESCE($8, '')
            AND upload_id = $9
        `
        const updateResult = await query(updateQuery, [
          artistId,
          trackName,
          platform,
          finalReportingDate,
          streams,
          countryCode,
          normalizedDeviceType,
          normalizedSource,
          uploadId
        ])

        if ((updateResult.rowCount || 0) === 0) {
          const insertQuery = `
            INSERT INTO streaming_analytics (
              artist_id, release_id, song_title, artist_name, platform, date,
              streams, country, device_type, source, upload_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `
          await query(insertQuery, [
            artistId,
            releaseId,
            trackName,
            artistName,
            platform,
            finalReportingDate,
            streams,
            countryCode,
            normalizedDeviceType,
            normalizedSource,
            uploadId
          ])
        }

      } else if (platformType === 'shazam') {
        // Handle Shazam data
        const country = getColumnValue(rowData, platformMapping, 'country')
        const state = getColumnValue(rowData, platformMapping, 'state')
        const city = getColumnValue(rowData, platformMapping, 'city')
        const shazamCount = parseInt(getColumnValue(rowData, platformMapping, 'shazam_count') || '0') || 0

        const insertQuery = `
          INSERT INTO shazam_analytics (
            artist_id, release_id, track_title, artist_name, country, state, city, isrc, shazam_count, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (artist_id, track_title, country, COALESCE(state, ''), COALESCE(city, ''), isrc)
          DO UPDATE SET
            shazam_count = shazam_analytics.shazam_count + EXCLUDED.shazam_count,
            updated_at = CURRENT_TIMESTAMP
        `

        const countryCode = country ? country.trim().substring(0, 2).toUpperCase() : null

        await query(insertQuery, [
          artistId,
          releaseId,
          trackName,
          artistName,
          countryCode,
          state,
          city,
          isrc,
            shazamCount,
            uploadId
        ])

      } else if (platformType === 'meta') {
        // Handle Meta data
        const service = getColumnValue(rowData, platformMapping, 'service')
        const productType = getColumnValue(rowData, platformMapping, 'product_type')
        const upc = getColumnValue(rowData, platformMapping, 'upc')
        const eventCount = parseInt(getColumnValue(rowData, platformMapping, 'event_count') || '0') || 0
        const territory = getColumnValue(rowData, platformMapping, 'territory')

        const insertQuery = `
          INSERT INTO meta_analytics (
            artist_id, release_id, song_title, artist_name, service, product_type, isrc, upc, event_count, territory, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (artist_id, song_title, service, product_type, COALESCE(territory, ''), isrc)
          DO UPDATE SET
            event_count = meta_analytics.event_count + EXCLUDED.event_count,
            updated_at = CURRENT_TIMESTAMP
        `

        await query(insertQuery, [
          artistId,
          releaseId,
          trackName,
          artistName,
          service,
          productType,
          isrc,
          upc,
          eventCount,
            territory,
            uploadId
        ])

      } else if (platformType === 'tiktok') {
        // Handle TikTok data
        const platformName = getColumnValue(rowData, platformMapping, 'platform_name')
        const songId = getColumnValue(rowData, platformMapping, 'song_id')
        const upc = getColumnValue(rowData, platformMapping, 'upc')
        const platformClassifiedGenre = getColumnValue(rowData, platformMapping, 'platform_classified_genre')
        const territory = getColumnValue(rowData, platformMapping, 'territory')
        const contentType = getColumnValue(rowData, platformMapping, 'content_type')
        const creations = parseInt(getColumnValue(rowData, platformMapping, 'creations') || '0') || 0
        const videoViews = parseInt(getColumnValue(rowData, platformMapping, 'video_views') || '0') || 0
        const comments = parseInt(getColumnValue(rowData, platformMapping, 'comments') || '0') || 0
        const likes = parseInt(getColumnValue(rowData, platformMapping, 'likes') || '0') || 0
        const shares = parseInt(getColumnValue(rowData, platformMapping, 'shares') || '0') || 0
        const favorites = parseInt(getColumnValue(rowData, platformMapping, 'favorites') || '0') || 0
        const averageWatchtime = parseFloat(getColumnValue(rowData, platformMapping, 'average_watchtime') || '0') || 0

        const insertQuery = `
          INSERT INTO tiktok_analytics (
            artist_id, release_id, song_title, artist_name, platform_name, song_id, isrc, upc,
            platform_classified_genre, territory, content_type, creations, video_views, comments,
            likes, shares, favorites, average_watchtime, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (artist_id, song_title, platform_name, COALESCE(territory, ''), content_type, isrc)
          DO UPDATE SET
            creations = tiktok_analytics.creations + EXCLUDED.creations,
            video_views = tiktok_analytics.video_views + EXCLUDED.video_views,
            comments = tiktok_analytics.comments + EXCLUDED.comments,
            likes = tiktok_analytics.likes + EXCLUDED.likes,
            shares = tiktok_analytics.shares + EXCLUDED.shares,
            favorites = tiktok_analytics.favorites + EXCLUDED.favorites,
            average_watchtime = EXCLUDED.average_watchtime,
            updated_at = CURRENT_TIMESTAMP
        `

        await query(insertQuery, [
          artistId,
          releaseId,
          trackName,
          artistName,
          platformName,
          songId,
          isrc,
          upc,
          platformClassifiedGenre,
          territory,
          contentType,
          creations,
          videoViews,
          comments,
          likes,
          shares,
          favorites,
            averageWatchtime,
            uploadId
        ])
      }

      recordsProcessed++
    }

    // Record the upload
    // Update upload with final counts
    const finalizeQuery = `
      UPDATE analytics_uploads
      SET total_records = $1
      WHERE id = $2
    `
    await query(finalizeQuery, [recordsProcessed, uploadId])

    let message = `Analytics data uploaded successfully. ${recordsProcessed} records processed.`
    if (skippedRecords > 0) {
      message += ` ${skippedRecords} records skipped (missing data or artist not found).`
    }

    return NextResponse.json({ 
      message,
      recordsProcessed,
      skippedRecords
    })

  } catch (error) {
    console.error('Analytics upload error:', error)
    return NextResponse.json({ error: 'Failed to upload analytics data' }, { status: 500 })
  }
}

// Add unique constraint to prevent duplicate entries
export async function PUT(request: NextRequest) {
  try {
    // Add unique constraint
    await query(`
      ALTER TABLE analytics_data 
      ADD CONSTRAINT unique_analytics_entry 
      UNIQUE (artist_id, track_name, platform, reporting_date, COALESCE(country, ''), COALESCE(city, ''))
    `)
    
    return NextResponse.json({ message: 'Constraint added successfully' })
  } catch (error) {
    console.error('Constraint error:', error)
    return NextResponse.json({ error: 'Failed to add constraint' }, { status: 500 })
  }
}
