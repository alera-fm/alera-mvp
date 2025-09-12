
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

async function processBatch(batchData: any[], platformMapping: any, reportingDate: string, platform: string) {
  console.log(`Processing batch with ${batchData.length} records for platform: ${platform}`)
  
  // Group batch data by platform type for efficient processing
  const streamingData = []
  const shazamData = []
  const metaData = []
  const tiktokData = []

  // Process each record in the batch
  for (const data of batchData) {
    const { rowData, platformType, trackName, isrc, releaseId, selectedArtistId, selectedArtistName, uploadId } = data

    if (platformType === 'streaming') {
      // Handle streaming platforms (Spotify, Apple Music, Deezer)
      const country = getColumnValue(rowData, platformMapping, 'country')
      const deviceType = getColumnValue(rowData, platformMapping, 'device_type')
      const source = getColumnValue(rowData, platformMapping, 'source')
      
      // Robust numeric parsing for stream counts
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

      const countryCode = country ? country.trim().substring(0, 2).toUpperCase() : ''
      const normalizedDeviceType = deviceType || ''
      const normalizedSource = source || ''

      streamingData.push({
        selectedArtistId,
        releaseId,
        trackName,
        selectedArtistName,
        platform,
        finalReportingDate,
        streams,
        countryCode,
        normalizedDeviceType,
        normalizedSource,
        uploadId
      })

    } else if (platformType === 'shazam') {
      // Handle Shazam data
      const country = getColumnValue(rowData, platformMapping, 'country')
      const state = getColumnValue(rowData, platformMapping, 'state')
      const city = getColumnValue(rowData, platformMapping, 'city')
      const shazamCount = parseInt(getColumnValue(rowData, platformMapping, 'shazam_count') || '0') || 0

      const countryCode = country ? country.trim().substring(0, 2).toUpperCase() : null

      shazamData.push({
        selectedArtistId,
        releaseId,
        trackName,
        selectedArtistName,
        countryCode,
        state,
        city,
        isrc,
        shazamCount,
        uploadId
      })

    } else if (platformType === 'meta') {
      // Handle Meta data
      const service = getColumnValue(rowData, platformMapping, 'service')
      const productType = getColumnValue(rowData, platformMapping, 'product_type')
      const upc = getColumnValue(rowData, platformMapping, 'upc')
      const eventCount = parseInt(getColumnValue(rowData, platformMapping, 'event_count') || '0') || 0
      const territory = getColumnValue(rowData, platformMapping, 'territory')

      metaData.push({
        selectedArtistId,
        releaseId,
        trackName,
        selectedArtistName,
        service,
        productType,
        isrc,
        upc,
        eventCount,
        territory,
        uploadId
      })

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

      tiktokData.push({
        selectedArtistId,
        releaseId,
        trackName,
        selectedArtistName,
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
      })
    }
  }

  console.log(`Batch data distribution: Streaming=${streamingData.length}, Shazam=${shazamData.length}, Meta=${metaData.length}, TikTok=${tiktokData.length}`)

  // Process streaming data in batch
  if (streamingData.length > 0) {
    console.log(`Processing ${streamingData.length} streaming records`)
    await processStreamingBatch(streamingData)
  }

  // Process Shazam data in batch
  if (shazamData.length > 0) {
    console.log(`Processing ${shazamData.length} Shazam records`)
    await processShazamBatch(shazamData)
  }

  // Process Meta data in batch
  if (metaData.length > 0) {
    console.log(`Processing ${metaData.length} Meta records`)
    await processMetaBatch(metaData)
  }

  // Process TikTok data in batch
  if (tiktokData.length > 0) {
    console.log(`Processing ${tiktokData.length} TikTok records`)
    await processTiktokBatch(tiktokData)
  }
  
  console.log(`Batch processing completed for platform: ${platform}`)
}

async function processStreamingBatch(streamingData: any[]) {
  console.log(`Starting streaming batch processing: ${streamingData.length} records`)
  
  if (streamingData.length === 0) return
  
  // Prepare batch insert data  
  const values = streamingData.map((data, index) => {
    const offset = index * 11 // 11 parameters per row
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`
  }).join(', ')
  
  const flatValues = streamingData.flatMap(data => {
    const { selectedArtistId, trackName, platform, finalReportingDate, streams, countryCode, normalizedDeviceType, normalizedSource, uploadId, releaseId, selectedArtistName } = data
    return [
      selectedArtistId,
      releaseId,
      trackName,
      selectedArtistName,
      platform,
      finalReportingDate,
      streams,
      countryCode,
      normalizedDeviceType,
      normalizedSource,
      uploadId
    ]
  })
  
  // Execute batch insert
  try {
    await query(`
      INSERT INTO streaming_analytics (
        artist_id, release_id, song_title, artist_name, platform, date,
        streams, country, device_type, source, upload_id
      ) VALUES ${values}
    `, flatValues)
    
    console.log(`Streaming batch insert completed: ${streamingData.length} records inserted`)
  } catch (error) {
    console.error(`Streaming batch insert failed, falling back to individual inserts:`, error)
    
    // Fallback to individual inserts if batch fails
    for (const data of streamingData) {
      try {
        const { selectedArtistId, trackName, platform, finalReportingDate, streams, countryCode, normalizedDeviceType, normalizedSource, uploadId, releaseId, selectedArtistName } = data
        
        await query(`
          INSERT INTO streaming_analytics (
            artist_id, release_id, song_title, artist_name, platform, date,
            streams, country, device_type, source, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          selectedArtistId,
          releaseId,
          trackName,
          selectedArtistName,
          platform,
          finalReportingDate,
          streams,
          countryCode,
          normalizedDeviceType,
          normalizedSource,
          uploadId
        ])
      } catch (individualError) {
        console.error(`Individual streaming insert failed:`, individualError)
      }
    }
  }
  
  console.log(`Streaming batch processing completed: ${streamingData.length} records processed`)
}

async function processShazamBatch(shazamData: any[]) {
  console.log(`Starting Shazam batch processing: ${shazamData.length} records`)
  
  if (shazamData.length === 0) return
  
  // Prepare batch insert data
  const values = shazamData.map((data, index) => {
    const offset = index * 10 // 10 parameters per row
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
  }).join(', ')
  
  const flatValues = shazamData.flatMap(data => {
    const { selectedArtistId, releaseId, trackName, selectedArtistName, countryCode, state, city, isrc, shazamCount, uploadId } = data
    return [
      selectedArtistId,
      releaseId,
      trackName,
      selectedArtistName,
      countryCode,
      state,
      city,
      isrc,
      shazamCount,
      uploadId
    ]
  })
  
  // Execute batch insert
  try {
    await query(`
      INSERT INTO shazam_analytics (
        artist_id, release_id, track_title, artist_name, country, state, city, isrc, shazam_count, upload_id
      ) VALUES ${values}
    `, flatValues)
    
    console.log(`Shazam batch insert completed: ${shazamData.length} records inserted`)
  } catch (error) {
    console.error(`Shazam batch insert failed, falling back to individual inserts:`, error)
    
    // Fallback to individual inserts if batch fails
    for (const data of shazamData) {
      try {
        const { selectedArtistId, releaseId, trackName, selectedArtistName, countryCode, state, city, isrc, shazamCount, uploadId } = data
        
        await query(`
          INSERT INTO shazam_analytics (
            artist_id, release_id, track_title, artist_name, country, state, city, isrc, shazam_count, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          selectedArtistId,
          releaseId,
          trackName,
          selectedArtistName,
          countryCode,
          state,
          city,
          isrc,
          shazamCount,
          uploadId
        ])
      } catch (individualError) {
        console.error(`Individual Shazam insert failed:`, individualError)
      }
    }
  }
  
  console.log(`Shazam batch processing completed: ${shazamData.length} records processed`)
}

async function processMetaBatch(metaData: any[]) {
  console.log(`Starting Meta batch processing: ${metaData.length} records`)
  
  if (metaData.length === 0) return
  
  // Prepare batch insert data
  const values = metaData.map((data, index) => {
    const offset = index * 11 // 11 parameters per row
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`
  }).join(', ')
  
  const flatValues = metaData.flatMap(data => {
    const { selectedArtistId, releaseId, trackName, selectedArtistName, service, productType, isrc, upc, eventCount, territory, uploadId } = data
    return [
      selectedArtistId,
      releaseId,
      trackName,
      selectedArtistName,
      service,
      productType,
      isrc,
      upc,
      eventCount,
      territory,
      uploadId
    ]
  })
  
  // Execute batch insert
  try {
    await query(`
      INSERT INTO meta_analytics (
        artist_id, release_id, song_title, artist_name, service, product_type, isrc, upc, event_count, territory, upload_id
      ) VALUES ${values}
    `, flatValues)
    
    console.log(`Meta batch insert completed: ${metaData.length} records inserted`)
  } catch (error) {
    console.error(`Meta batch insert failed, falling back to individual inserts:`, error)
    
    // Fallback to individual inserts if batch fails
    for (const data of metaData) {
      try {
        const { selectedArtistId, releaseId, trackName, selectedArtistName, service, productType, isrc, upc, eventCount, territory, uploadId } = data
        
        await query(`
          INSERT INTO meta_analytics (
            artist_id, release_id, song_title, artist_name, service, product_type, isrc, upc, event_count, territory, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          selectedArtistId,
          releaseId,
          trackName,
          selectedArtistName,
          service,
          productType,
          isrc,
          upc,
          eventCount,
          territory,
          uploadId
        ])
      } catch (individualError) {
        console.error(`Individual Meta insert failed:`, individualError)
      }
    }
  }
  
  console.log(`Meta batch processing completed: ${metaData.length} records processed`)
}

async function processTiktokBatch(tiktokData: any[]) {
  console.log(`Starting TikTok batch processing: ${tiktokData.length} records`)
  
  if (tiktokData.length === 0) return
  
  // Prepare batch insert data
  const values = tiktokData.map((data, index) => {
    const offset = index * 19 // 19 parameters per row
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19})`
  }).join(', ')
  
  const flatValues = tiktokData.flatMap(data => {
    const { selectedArtistId, releaseId, trackName, selectedArtistName, platformName, songId, isrc, upc, platformClassifiedGenre, territory, contentType, creations, videoViews, comments, likes, shares, favorites, averageWatchtime, uploadId } = data
    return [
      selectedArtistId,
      releaseId,
      trackName,
      selectedArtistName,
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
    ]
  })
  
  // Execute batch insert
  try {
    await query(`
      INSERT INTO tiktok_analytics (
        artist_id, release_id, song_title, artist_name, platform_name, song_id, isrc, upc,
        platform_classified_genre, territory, content_type, creations, video_views, comments,
        likes, shares, favorites, average_watchtime, upload_id
      ) VALUES ${values}
    `, flatValues)
    
    console.log(`TikTok batch insert completed: ${tiktokData.length} records inserted`)
  } catch (error) {
    console.error(`TikTok batch insert failed, falling back to individual inserts:`, error)
    
    // Fallback to individual inserts if batch fails
    for (const data of tiktokData) {
      try {
        const { selectedArtistId, releaseId, trackName, selectedArtistName, platformName, songId, isrc, upc, platformClassifiedGenre, territory, contentType, creations, videoViews, comments, likes, shares, favorites, averageWatchtime, uploadId } = data
        
        await query(`
          INSERT INTO tiktok_analytics (
            artist_id, release_id, song_title, artist_name, platform_name, song_id, isrc, upc,
            platform_classified_genre, territory, content_type, creations, video_views, comments,
            likes, shares, favorites, average_watchtime, upload_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          selectedArtistId,
          releaseId,
          trackName,
          selectedArtistName,
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
      } catch (individualError) {
        console.error(`Individual TikTok insert failed:`, individualError)
      }
    }
  }
  
  console.log(`TikTok batch processing completed: ${tiktokData.length} records processed`)
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
    const artistId = formData.get('artist_id') as string

    if (!file || !platform || !reportingDate || !artistId) {
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
    const batchSize = 100 // Process in batches of 100 rows

    // Create upload record first to obtain upload_id
    const createUploadQuery = `
      INSERT INTO analytics_uploads (filename, platform, reporting_date, total_records, uploaded_by, artist_id)
      VALUES ($1, $2, $3, 0, $4, $5)
      RETURNING id
    `
    const createUploadResult = await query(createUploadQuery, [file.name, platform, reportingDate, decoded.userId, parseInt(artistId)])
    const uploadId = createUploadResult.rows[0].id

    // Get artist name for the selected artist
    const artistQuery = 'SELECT artist_name FROM users WHERE id = $1'
    const artistResult = await query(artistQuery, [parseInt(artistId)])
    if (artistResult.rows.length === 0) {
      return NextResponse.json({ error: 'Selected artist not found' }, { status: 400 })
    }
    const selectedArtistName = artistResult.rows[0].artist_name

    // Process data in batches for better performance
    console.log(`Starting batch processing: ${lines.length - 1} total records, batch size: ${batchSize}`)
    
    for (let batchStart = 1; batchStart < lines.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, lines.length)
      const batchData = []
      
      console.log(`Processing batch ${Math.ceil(batchStart / batchSize)}: rows ${batchStart}-${batchEnd - 1}`)
      
      // Prepare batch data
      for (let i = batchStart; i < batchEnd; i++) {
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
        const trackName = getColumnValue(rowData, platformMapping, 'track_name')
        const isrc = getColumnValue(rowData, platformMapping, 'isrc')

        if (!trackName) {
          skippedRecords++
          continue
        }

        // Use the selected artist ID instead of looking up from file
        const selectedArtistId = parseInt(artistId)

        // Find release ID for this track
        let releaseId = null
        
        // First try to match by ISRC if available
        if (isrc) {
          const isrcQuery = `
            SELECT t.release_id FROM tracks t 
            JOIN releases r ON t.release_id = r.id
            WHERE r.artist_id = $1 AND t.isrc = $2
            LIMIT 1
          `
          const isrcResult = await query(isrcQuery, [selectedArtistId, isrc])
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
          const trackResult = await query(trackQuery, [selectedArtistId, trackName])
          releaseId = trackResult.rows[0]?.release_id || null
        }

        // Prepare data for batch processing
        const platformType = platformMapping.type
        const processedData = {
          rowIndex: i,
          trackName,
          isrc,
          releaseId,
          platformType,
          rowData,
          selectedArtistId,
          selectedArtistName,
          uploadId
        }

        batchData.push(processedData)
      }

      // Process the batch
      if (batchData.length > 0) {
        console.log(`Batch ${Math.ceil(batchStart / batchSize)} prepared: ${batchData.length} records`)
        await processBatch(batchData, platformMapping, reportingDate, platform)
        recordsProcessed += batchData.length
        console.log(`Batch ${Math.ceil(batchStart / batchSize)} completed: ${batchData.length} records processed`)
      }
    }
    
    console.log(`Batch processing completed: ${recordsProcessed} total records processed, ${skippedRecords} skipped`)

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
      message += ` ${skippedRecords} records skipped (missing required data).`
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
