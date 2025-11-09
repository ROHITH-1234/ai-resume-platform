import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') || ''
    const location = url.searchParams.get('location') || ''
    const salary = url.searchParams.get('salary') || ''
    const country = (url.searchParams.get('country') || process.env.ADZUNA_COUNTRY || 'us').toLowerCase()

    const app_id = process.env.ADZUNA_APP_ID
    const app_key = process.env.ADZUNA_APP_KEY

    if (!app_id || !app_key) {
      return NextResponse.json({ error: 'Missing Adzuna credentials. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in env.' }, { status: 500 })
    }

    const params = new URLSearchParams({ app_id, app_key, results_per_page: '20' })
    if (keyword) params.set('what', keyword)
    if (location) params.set('where', location)
    if (salary) params.set('salary_min', salary)

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1?${params.toString()}`

    const res = await fetch(adzunaUrl)
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Adzuna API error', details: text }, { status: res.status })
    }

    const data = await res.json()
    const results = (data.results || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      company: r.company?.display_name || r.company,
      location: r.location?.display_name || r.location,
      redirect_url: r.redirect_url,
      salary_min: r.salary_min,
      salary_max: r.salary_max,
      description: r.description,
    }))

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
