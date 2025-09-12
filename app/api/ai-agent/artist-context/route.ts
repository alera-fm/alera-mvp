import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

// GET: Retrieve artist context and onboarding status
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Get artist context
    const contextQuery = `
      SELECT career_description, current_goals, release_strategy, preferred_genres, 
             target_audience, experience_level, monthly_release_frequency, 
             primary_platforms, collaboration_preferences, marketing_focus
      FROM ai_artist_context 
      WHERE user_id = $1
    `
    const contextResult = await query(contextQuery, [userId])
    const artistContext = contextResult.rows[0] || null

    // Get onboarding status
    const onboardingQuery = `
      SELECT is_completed, completed_questions, onboarding_started_at, onboarding_completed_at
      FROM ai_onboarding_status 
      WHERE user_id = $1
    `
    const onboardingResult = await query(onboardingQuery, [userId])
    const onboardingStatus = onboardingResult.rows[0] || null

    return NextResponse.json({ 
      artistContext, 
      onboardingStatus 
    })
  } catch (error) {
    console.error('Error fetching artist context:', error)
    return NextResponse.json({ error: 'Failed to fetch artist context' }, { status: 500 })
  }
}

// POST: Save or update artist context
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const {
      careerDescription,
      currentGoals,
      releaseStrategy,
      preferredGenres,
      targetAudience,
      experienceLevel,
      monthlyReleaseFrequency,
      primaryPlatforms,
      collaborationPreferences,
      marketingFocus
    } = await request.json()

    // Check if context already exists
    const checkQuery = 'SELECT id FROM ai_artist_context WHERE user_id = $1'
    const checkResult = await query(checkQuery, [userId])

    if (checkResult.rows.length > 0) {
      // Update existing context
      const updateQuery = `
        UPDATE ai_artist_context 
        SET career_description = $2, current_goals = $3, release_strategy = $4, 
            preferred_genres = $5, target_audience = $6, experience_level = $7,
            monthly_release_frequency = $8, primary_platforms = $9, 
            collaboration_preferences = $10, marketing_focus = $11
        WHERE user_id = $1
        RETURNING id
      `
      await query(updateQuery, [
        userId, careerDescription, currentGoals, releaseStrategy, preferredGenres,
        targetAudience, experienceLevel, monthlyReleaseFrequency, primaryPlatforms,
        collaborationPreferences, marketingFocus
      ])
    } else {
      // Insert new context
      const insertQuery = `
        INSERT INTO ai_artist_context (
          user_id, career_description, current_goals, release_strategy, 
          preferred_genres, target_audience, experience_level, monthly_release_frequency,
          primary_platforms, collaboration_preferences, marketing_focus
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `
      await query(insertQuery, [
        userId, careerDescription, currentGoals, releaseStrategy, preferredGenres,
        targetAudience, experienceLevel, monthlyReleaseFrequency, primaryPlatforms,
        collaborationPreferences, marketingFocus
      ])
    }

    return NextResponse.json({ success: true, message: 'Artist context saved' })
  } catch (error) {
    console.error('Error saving artist context:', error)
    return NextResponse.json({ error: 'Failed to save artist context' }, { status: 500 })
  }
}

// PUT: Update onboarding status
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const { isCompleted, completedQuestions } = await request.json()

    // Check if onboarding status exists
    const checkQuery = 'SELECT id FROM ai_onboarding_status WHERE user_id = $1'
    const checkResult = await query(checkQuery, [userId])

    if (checkResult.rows.length > 0) {
      // Update existing status
      const updateQuery = `
        UPDATE ai_onboarding_status 
        SET is_completed = $2, completed_questions = $3, 
            onboarding_completed_at = CASE WHEN $2 = true THEN CURRENT_TIMESTAMP ELSE onboarding_completed_at END
        WHERE user_id = $1
      `
      await query(updateQuery, [userId, isCompleted, completedQuestions])
    } else {
      // Insert new status
      const insertQuery = `
        INSERT INTO ai_onboarding_status (user_id, is_completed, completed_questions)
        VALUES ($1, $2, $3)
      `
      await query(insertQuery, [userId, isCompleted, completedQuestions])
    }

    return NextResponse.json({ success: true, message: 'Onboarding status updated' })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 })
  }
} 