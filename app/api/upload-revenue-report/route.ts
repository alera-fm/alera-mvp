import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const artistId = formData.get('artist_id') as string

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.tsv') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a .tsv or .csv file' }, { status: 400 })
    }

    const content = await file.text()

    // Split lines and filter out completely empty ones, but keep lines with tabs/commas
    // Handle both \n and \r\n line endings
    const allLines = content.split(/\r?\n|\r/)
    const lines = allLines.filter(line => line.trim() !== '' && line.length > 0)

    console.log('Raw content preview:', content.substring(0, 500))
    console.log('Total lines after filtering:', lines.length)
    console.log('First few lines:', lines.slice(0, 3))

    if (lines.length < 2) {
      return NextResponse.json({ 
        error: 'File must contain at least a header and one data row',
        debug: {
          totalLinesInFile: allLines.length,
          nonEmptyLines: lines.length,
          firstFewLines: lines.slice(0, 5)
        }
      }, { status: 400 })
    }

    const delimiter = file.name.endsWith('.tsv') ? '\t' : ','
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())

    console.log('Headers found:', headers)
    console.log('File delimiter:', delimiter)
    console.log('Total lines:', lines.length)

    // Find column indices - flexible header mapping
    const findColumnIndex = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => 
          h.toLowerCase().trim() === name.toLowerCase() || 
          h.toLowerCase().includes(name.toLowerCase())
        )
        if (index !== -1) return index
      }
      return -1
    }

    const columnIndices = {
      reportingMonth: findColumnIndex(['reporting date']),
      saleMonth: findColumnIndex(['sale month']),
      store: findColumnIndex(['store']),
      artist: findColumnIndex(['artist']),
      title: findColumnIndex(['title']),
      quantity: findColumnIndex(['quantity']),
      songAlbum: findColumnIndex(['song/album']),
      customerPaid: findColumnIndex(['customer paid']),
      countryOfSale: findColumnIndex(['country of sale']),
      earnings: findColumnIndex(['earnings (usd)'])
    }

    console.log('Column indices:', columnIndices)

    // Check if we have minimum required columns
    if (columnIndices.saleMonth === -1 || columnIndices.store === -1 || columnIndices.earnings === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found. Need at least: Sale Month, Store/Platform, and Earnings',
        foundHeaders: headers,
        requiredColumns: ['sale month', 'store/platform', 'earnings']
      }, { status: 400 })
    }

    const processed = []
    const errors = []
    const batchSize = 100 // Process in batches of 100 rows
    let totalEarningsProcessed = 0

    // Use the provided artist_id from the form data
    const artistIdInt = parseInt(artistId)
    
    // Initialize reportingDateFormatted outside the loop
    let reportingDateFormatted = null

    // Process data in batches for better performance
    for (let batchStart = 1; batchStart < lines.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, lines.length)
      const batchData = []
      

      // Prepare batch data
      for (let i = batchStart; i < batchEnd; i++) {
        const row = lines[i].split(delimiter).map(cell => cell.trim())

        if (row.length < headers.length) {
          errors.push(`Row ${i + 1}: Insufficient columns`)
          continue
        }

        try {
          const saleMonth = row[columnIndices.saleMonth]
          const store = row[columnIndices.store]
          const earnings = parseFloat(row[columnIndices.earnings] || '0')
          

          // Get all available fields from TSV
          const reportingMonth = columnIndices.reportingMonth !== -1 ? row[columnIndices.reportingMonth] : null
          const artist = columnIndices.artist !== -1 ? row[columnIndices.artist] : null
          const title = columnIndices.title !== -1 ? row[columnIndices.title] : null
          const isrc = headers.includes('isrc') ? row[headers.indexOf('isrc')] : null
          const upc = headers.includes('upc') ? row[headers.indexOf('upc')] : null
          const quantity = columnIndices.quantity !== -1 ? parseInt(row[columnIndices.quantity] || '0') : null
          const teamPercentage = headers.includes('team percentage') ? parseFloat(row[headers.indexOf('team percentage')] || '0') : null
          const songAlbum = columnIndices.songAlbum !== -1 ? row[columnIndices.songAlbum] : null
          const countryOfSale = columnIndices.countryOfSale !== -1 ? row[columnIndices.countryOfSale] : null
          const songwriterRoyaltiesWithheld = headers.includes('songwriter royalties withheld') ? parseFloat(row[headers.indexOf('songwriter royalties withheld')] || '0') : null
          const customerPaid = columnIndices.customerPaid !== -1 ? parseFloat(row[columnIndices.customerPaid] || '0') : null

          if (!saleMonth || !store || isNaN(earnings)) {
            errors.push(`Row ${i + 1}: Missing required data (sale month, store, or earnings)`)
            continue
          }

          // Convert date formats - handle various formats
          let saleDateFormatted
          try {
            if (saleMonth.includes('-')) {
              saleDateFormatted = saleMonth.substring(0, 7) + '-01' // YYYY-MM-01
            } else if (saleMonth.includes('/')) {
              const [month, year] = saleMonth.split('/')
              saleDateFormatted = `${year}-${month.padStart(2, '0')}-01`
            } else {
              saleDateFormatted = saleMonth + '-01'
            }
          } catch (dateError) {
            errors.push(`Row ${i + 1}: Invalid date format: ${saleMonth}`)
            continue
          }

          if (reportingMonth && !reportingDateFormatted) {
            try {
              if (reportingMonth.includes('-')) {
                reportingDateFormatted = reportingMonth.substring(0, 7) + '-01'
              } else if (reportingMonth.includes('/')) {
                const [month, year] = reportingMonth.split('/')
                reportingDateFormatted = `${year}-${month.padStart(2, '0')}-01`
              } else {
                reportingDateFormatted = reportingMonth + '-01'
              }
            } catch (dateError) {
              reportingDateFormatted = null
            }
          }

          batchData.push({
            row: i + 1,
            data: [
              artistIdInt, reportingDateFormatted, saleDateFormatted, store, artist, title, isrc, upc,
              quantity, teamPercentage, songAlbum, countryOfSale, songwriterRoyaltiesWithheld, earnings
            ],
            processed: { 
              row: i + 1,
              saleMonth: saleDateFormatted, 
              store, 
              title: title, // Use original title for display
              earnings
            }
          })
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error)
          errors.push(`Row ${i + 1}: Processing error - ${error.message}`)
        }
      }

      // Execute batch insert if we have data
      if (batchData.length > 0) {
        try {
          // Process all records in the batch - no duplicate detection
          // Every row should be inserted regardless of duplicates
          if (batchData.length > 0) {
            const values = batchData.map((item, index) => {
              const offset = index * 14 // 14 parameters per row
              return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, CURRENT_TIMESTAMP)`
            }).join(', ')

            const flatValues = batchData.flatMap(item => item.data)

            await pool.query(`
              INSERT INTO streaming_earnings (
                artist_id, reporting_month, sale_month, platform, artist, title, isrc, upc, 
                quantity, team_percentage, song_album, country_of_sale, 
                songwriter_royalties_withheld, amount_usd, uploaded_at
              )
              VALUES ${values}
            `, flatValues)

            // Add successful records to processed array
            processed.push(...batchData.map(item => item.processed))
            
            // Track total earnings processed
            const batchEarnings = batchData.reduce((sum, item) => sum + item.processed.earnings, 0)
            totalEarningsProcessed += batchEarnings
            
          }
        } catch (error) {
          console.error(`Error inserting batch:`, error)
          
          // If batch fails due to unique constraint, try individual inserts for this batch
          for (const item of batchData) {
            try {
              await pool.query(`
                INSERT INTO streaming_earnings (
                  artist_id, reporting_month, sale_month, platform, artist, title, isrc, upc, 
                  quantity, team_percentage, song_album, country_of_sale, 
                  songwriter_royalties_withheld, amount_usd, uploaded_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
              `, item.data)
              
              processed.push(item.processed)
            } catch (individualError) {
              errors.push(`Row ${item.row}: Database error - ${individualError.message}`)
            }
          }
        }
      }
    }

    // Record upload history
    const platformsInUpload = [...new Set(processed.map(p => p.store))]
    const totalAmount = processed.reduce((sum, p) => sum + p.earnings, 0)

    await pool.query(`
      INSERT INTO upload_history (
        artist_id, filename, reporting_month, total_records, total_amount, 
        platform_count, upload_status, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      artistIdInt,
      file.name || 'unknown.tsv',
      reportingDateFormatted,
      processed.length,
      totalAmount,
      platformsInUpload.length,
      errors.length > 0 ? 'partial_success' : 'success',
      artistIdInt // For now, using same as artist_id, but should be admin ID
    ])



    return NextResponse.json({ 
      message: `File processed successfully. ${processed.length} records processed.`,
      processed: processed.length,
      data: processed,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalRows: lines.length - 1,
        successfulRows: processed.length,
        errorRows: errors.length,
        totalEarningsProcessed: totalEarningsProcessed
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error.message 
    }, { status: 500 })
  }
}
