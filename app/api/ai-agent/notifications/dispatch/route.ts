import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const DAY_MS = 24 * 60 * 60 * 1000

async function hasLandingPage(userId: number): Promise<boolean> {
  try {
    const res = await query('SELECT 1 FROM landing_pages WHERE artist_id = $1 LIMIT 1', [userId])
    return res.rows.length > 0
  } catch {
    return false
  }
}

async function hasAnyRelease(userId: number): Promise<boolean> {
  const res = await query('SELECT 1 FROM releases WHERE artist_id = $1 LIMIT 1', [userId])
  return res.rows.length > 0
}

async function hasPayoutMethod(userId: number): Promise<boolean> {
  try {
    const res = await query('SELECT 1 FROM payout_methods WHERE artist_id = $1 LIMIT 1', [userId])
    return res.rows.length > 0
  } catch {
    return false
  }
}

async function hasTipsEnabled(userId: number): Promise<boolean> {
  try {
    const res = await query('SELECT page_config FROM landing_pages WHERE artist_id = $1 LIMIT 1', [userId])
    if (res.rows.length === 0) return false
    const cfg = res.rows[0].page_config
    const blocks = Array.isArray(cfg?.blocks) ? cfg.blocks : []
    return blocks.some((b: any) => b?.type === 'tipJar' && b?.enabled === true)
  } catch {
    return false
  }
}

async function hasStripeConnected(userId: number): Promise<boolean> {
  try {
    const res = await query('SELECT method FROM payout_methods WHERE artist_id = $1 LIMIT 1', [userId])
    if (res.rows.length === 0) return false
    return (res.rows[0].method || '').toLowerCase() === 'stripe'
  } catch {
    return false
  }
}

async function alreadySent(userId: number, key: string): Promise<boolean> {
  const res = await query('SELECT 1 FROM ai_notification_log WHERE user_id = $1 AND notification_key = $2', [userId, key])
  return res.rows.length > 0
}

async function logSent(userId: number, key: string) {
  await query('INSERT INTO ai_notification_log (user_id, notification_key) VALUES ($1, $2) ON CONFLICT (user_id, notification_key) DO NOTHING', [userId, key])
}

async function insertAIMsg(userId: number, html: string) {
  await query(
    'INSERT INTO ai_chat_messages (user_id, message_text, is_user_message, intent_classified, data_context, is_unread, message_kind) VALUES ($1, $2, false, $3, $4, true, $5)',
    [userId, html, 'system_notification', null, 'notification']
  )
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-cron-secret') || new URL(request.url).searchParams.get('secret')
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Consider users active if they have a login in last 21 days
    const usersRes = await query(`
      SELECT u.id, u.created_at,
             COALESCE((SELECT MAX(login_time) FROM login_history lh WHERE lh.user_id = u.id), u.created_at) AS last_active
      FROM users u
    `)

    const now = Date.now()
    let dispatched = 0

    for (const row of usersRes.rows) {
      const userId = row.id as number
      const createdAt = new Date(row.created_at).getTime()
      const daysSinceSignup = Math.floor((now - createdAt) / DAY_MS)

      // Day 1: no landing page
      if (daysSinceSignup >= 1) {
        const key = 'day1_setup_landing_page'
        if (!(await alreadySent(userId, key)) && !(await hasLandingPage(userId))) {
          await insertAIMsg(userId, `Welcome! A great first step is to set up your public artist page. It gives you a central hub for fans to find your music. Ready to build yours in the 'My Page' tab? <a href="https://artist-cockpit-design.vercel.app/dashboard/my-page">Open My Page</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 3: no release
      if (daysSinceSignup >= 3) {
        const key = 'day3_start_release'
        if (!(await alreadySent(userId, key)) && !(await hasAnyRelease(userId))) {
          await insertAIMsg(userId, `Whenever you're ready to get your next track out to the world, I can walk you through the process. Just head over to the 'New Release' tab to get started. <a href="https://artist-cockpit-design.vercel.app/dashboard/new-release">Start a new release</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 7: no payout method
      if (daysSinceSignup >= 7) {
        const key = 'day7_add_payout_method'
        if (!(await alreadySent(userId, key)) && !(await hasPayoutMethod(userId))) {
          await insertAIMsg(userId, `Just a heads-up, it's a good idea to set up your payout method in the 'Wallet' tab now. That way, you'll be ready to withdraw your earnings as soon as they arrive. <a href="https://artist-cockpit-design.vercel.app/dashboard/wallet">Open Wallet</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 10: has landing page
      if (daysSinceSignup >= 10) {
        const key = 'day10_lp_tips_and_email'
        if (!(await alreadySent(userId, key)) && (await hasLandingPage(userId))) {
          await insertAIMsg(userId, `Your landing page is looking great. Did you know you can start collecting fan emails or even earn money from tips right away? You can enable these features in the 'My Page' editor. <a href="https://artist-cockpit-design.vercel.app/dashboard/my-page">Open My Page</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 12: general nudge
      if (daysSinceSignup >= 12) {
        const key = 'day12_lp_tips_and_email_nudge'
        if (!(await alreadySent(userId, key))) {
          await insertAIMsg(userId, `Your landing page is looking great. Did you know you can start collecting fan emails or even earn money from tips right away? You can enable these features in the 'My Page' editor. <a href="https://artist-cockpit-design.vercel.app/dashboard/my-page">Open My Page</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 14: still no release
      if (daysSinceSignup >= 14) {
        const key = 'day14_release_reminder'
        if (!(await alreadySent(userId, key)) && !(await hasAnyRelease(userId))) {
          await insertAIMsg(userId, `Whenever you're ready to get your next track out to the world, I can walk you through the process. Just head over to the 'New Release' tab to get started. <a href="https://artist-cockpit-design.vercel.app/dashboard/new-release">Start a new release</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 17: tips enabled, no stripe
      if (daysSinceSignup >= 17) {
        const key = 'day17_connect_stripe_for_tips'
        if (!(await alreadySent(userId, key)) && (await hasTipsEnabled(userId)) && !(await hasStripeConnected(userId))) {
          await insertAIMsg(userId, `I see you've enabled tips on your landing page, which is great! The final step is to connect your Stripe account in the 'Wallet' tab so you can receive payments directly from fans. <a href="https://artist-cockpit-design.vercel.app/dashboard/wallet">Open Wallet</a>.`)
          await logSent(userId, key)
          dispatched++
        }
      }

      // Day 20: general AI prompt
      if (daysSinceSignup >= 20) {
        const key = 'day20_ask_anything'
        if (!(await alreadySent(userId, key))) {
          await insertAIMsg(userId, `Don't forget, you can ask me anything about getting your career set up on ALERA. Try asking, 'What should I include in my artist bio?' or 'Help me with a campaign for my upcoming release'.`)
          await logSent(userId, key)
          dispatched++
        }
      }
    }

    return NextResponse.json({ success: true, dispatched })
  } catch (e) {
    console.error('Dispatch notifications error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


