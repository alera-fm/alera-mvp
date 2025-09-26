import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const tokenData = verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await request.json()
    const { releaseId, formData, currentStep } = data

    if (!releaseId) {
      return NextResponse.json({ error: 'Release ID is required' }, { status: 400 })
    }

    // Check if release exists and belongs to user
    const existingRelease = await pool.query(
      'SELECT * FROM releases WHERE id = $1 AND artist_id = $2',
      [releaseId, tokenData.userId]
    )

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Update release with form data (no validation)
    const updateFields = []
    const values = []
    let paramCount = 1

    // Map form fields to database columns
    const fieldMapping = {
      distribution_type: 'distribution_type',
      artist_name: 'artist_name', 
      release_title: 'release_title',
      record_label: 'record_label',
      c_line: 'c_line',
      p_line: 'p_line',
      has_spotify_profile: 'has_spotify_profile',
      spotify_profile_url: 'spotify_profile_url',
      has_apple_profile: 'has_apple_profile',
      apple_profile_url: 'apple_profile_url',
      additional_delivery: 'additional_delivery',
      primary_genre: 'primary_genre',
      secondary_genre: 'secondary_genre',
      language: 'language',
      explicit_lyrics: 'explicit_lyrics',
      instrumental: 'instrumental',
      version_info: 'version_info',
      version_other: 'version_other',
      original_release_date: 'original_release_date',
      previously_released: 'previously_released',
      album_cover_url: 'album_cover_url',
      selected_stores: 'selected_stores',
      track_price: 'track_price',
      terms_agreed: 'terms_agreed',
      fake_streaming_agreement: 'fake_streaming_agreement',
      distribution_agreement: 'distribution_agreement',
      artist_names_agreement: 'artist_names_agreement',
      snapchat_terms: 'snapchat_terms',
      youtube_music_agreement: 'youtube_music_agreement',
      fraud_prevention_agreement: 'fraud_prevention_agreement',
      release_date: 'release_date'
    }

    // Build update query dynamically based on provided fields
    for (const [formField, dbField] of Object.entries(fieldMapping)) {
      if (formData.hasOwnProperty(formField)) {
        let value = formData[formField]
        
        // Handle special cases
        if (formField === 'additional_delivery' || formField === 'selected_stores') {
          value = JSON.stringify(value || [])
        }
        
        // Handle date fields - don't update if empty string
        if ((formField === 'release_date' || formField === 'original_release_date') && (!value || value === '')) {
          continue // Skip empty date fields
        }
        
        updateFields.push(`${dbField} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    // Add current_step if provided
    if (currentStep) {
      // Map step numbers to descriptive names
      const stepMap: {[key: string]: string} = {
        'step_1': 'basic_info',
        'step_2': 'tracks', 
        'step_3': 'terms'
      };
      
      const mappedStep = stepMap[currentStep] || currentStep;
      updateFields.push(`current_step = $${paramCount}`)
      values.push(mappedStep)
      paramCount++
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    
    // Add WHERE clause parameters
    values.push(releaseId, tokenData.userId)

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updateQuery = `
      UPDATE releases 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND artist_id = $${paramCount + 1}
      RETURNING *
    `

    const result = await pool.query(updateQuery, values)

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      release: result.rows[0]
    })

  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}
