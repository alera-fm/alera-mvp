import LandingPage from "@/components/landing-page"
import { query } from "@/lib/db"

export default async function PublicLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await query('SELECT page_config FROM landing_pages WHERE slug = $1', [slug])
  if (!res.rows.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl font-bold">Artist page not found</h1>
          <p className="text-white/70">
            The artist page you’re looking for doesn’t exist or hasn’t been published yet.
          </p>
        </div>
      </div>
    )
  }
  const config = res.rows[0].page_config
  return <LandingPage config={config} />
}
