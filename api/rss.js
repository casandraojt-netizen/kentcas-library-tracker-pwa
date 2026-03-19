// Vercel serverless function for RSS fetching
const https = require('https')
const http = require('http')

function fetchRaw(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) { reject(new Error('Too many redirects')); return }
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      timeout: 12000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRaw(res.headers.location, redirectCount + 1).then(resolve).catch(reject)
      }
      let data = ''
      res.setEncoding('utf8')
      res.on('data', c => data += c)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timed out')) })
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { feedUrl } = req.body || {}
  if (!feedUrl) return res.status(400).json({ error: 'Missing feedUrl' })

  try {
    const url = feedUrl + (feedUrl.includes('?') ? '&' : '?') + '_t=' + Date.now()
    const { status, body } = await fetchRaw(url)

    if (status !== 200 || !body) {
      return res.status(200).json({ success: false, error: 'Feed returned no content', items: [] })
    }

    if (body.trimStart().startsWith('<!DOCTYPE') || body.trimStart().startsWith('<html')) {
      return res.status(200).json({ success: false, error: 'Server returned HTML instead of RSS. May be rate-limited.', items: [] })
    }

    // Parse RSS manually — simple regex approach, no dependencies
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(body)) !== null) {
      const block = match[1]
      const getTag = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`))
        return m ? (m[1] || m[2] || '').trim() : ''
      }
      const link = getTag('link') || getTag('guid')
      const title = getTag('title')
      const pubDate = getTag('pubDate')
      if (title) items.push({ title, link, pubDate })
    }

    res.status(200).json({ success: true, items })
  } catch (err) {
    res.status(200).json({ success: false, error: err.message, items: [] })
  }
}
