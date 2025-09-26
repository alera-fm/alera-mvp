import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
    const { step, formData } = data

    if (!step || !formData) {
      return NextResponse.json({ error: 'Step and form data are required' }, { status: 400 })
    }

    const errors = []
    const warnings = []

    // Step-by-step validation
    switch (step) {
      case 1: // Basic Info
        if (!formData.distribution_type) {
          errors.push('Distribution type is required')
        }
        if (!formData.artist_name?.trim()) {
          errors.push('Artist name is required')
        }
        if (!formData.release_title?.trim()) {
          errors.push('Release title is required')
        }
        if (!formData.record_label?.trim()) {
          errors.push('Record label is required')
        }
        if (!formData.c_line?.trim()) {
          errors.push('C-Line is required')
        }
        if (!formData.p_line?.trim()) {
          errors.push('P-Line is required')
        }
        if (!formData.primary_genre) {
          errors.push('Primary genre is required')
        }
        if (!formData.language) {
          errors.push('Language is required')
        }
        if (!formData.release_date) {
          errors.push('Release date is required')
        } else {
          // Validate release date is at least 7 days in the future
          const releaseDateTime = new Date(formData.release_date)
          const minReleaseDate = new Date()
          minReleaseDate.setDate(minReleaseDate.getDate() + 7)

          if (releaseDateTime < minReleaseDate) {
            errors.push('Release date must be at least 7 days in the future')
          }
        }
        break

      case 2: // Tracks
        if (!formData.tracks || formData.tracks.length === 0) {
          errors.push('At least one track is required')
        } else {
          // Validate each track
          formData.tracks.forEach((track: any, index: number) => {
            if (!track.track_title?.trim()) {
              errors.push(`Track ${index + 1}: Title is required`)
            }
            if (!track.songwriters || track.songwriters.length === 0) {
              errors.push(`Track ${index + 1}: At least one songwriter is required`)
            } else {
              track.songwriters.forEach((songwriter: any, swIndex: number) => {
                if (!songwriter.firstName?.trim() || !songwriter.lastName?.trim() || !songwriter.role?.trim()) {
                  errors.push(`Track ${index + 1}, Songwriter ${swIndex + 1}: First name, last name, and role are required`)
                }
              })
            }
          })
        }
        break

      case 3: // Artwork
        if (!formData.album_cover_url?.trim()) {
          errors.push('Album cover is required')
        }
        break

      case 4: // Distribution
        if (!formData.selected_stores || formData.selected_stores.length === 0) {
          errors.push('At least one store must be selected')
        }
        if (formData.track_price === undefined || formData.track_price === null) {
          errors.push('Track price is required')
        }
        break

      case 5: // Review
        if (!formData.terms_agreed) {
          errors.push('You must agree to the terms and conditions')
        }
        if (!formData.fake_streaming_agreement) {
          errors.push('You must agree to the fake streaming prevention terms')
        }
        if (!formData.distribution_agreement) {
          errors.push('You must agree to the distribution agreement')
        }
        if (!formData.artist_names_agreement) {
          errors.push('You must agree to the artist names agreement')
        }
        if (!formData.snapchat_terms) {
          errors.push('You must agree to the Snapchat terms')
        }
        if (!formData.youtube_music_agreement) {
          errors.push('You must agree to the YouTube Music agreement')
        }
        break

      default:
        errors.push('Invalid step number')
    }

    return NextResponse.json({
      success: errors.length === 0,
      errors,
      warnings,
      step
    })

  } catch (error) {
    console.error('Error validating step:', error)
    return NextResponse.json(
      { error: 'Failed to validate step' },
      { status: 500 }
    )
  }
}
