// Vercel serverless function for RSS fetching — uses fetch (available in Node 18+)
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return res.status(200).json({ success: false, error: `Feed returned HTTP ${response.status}`, items: [] })
    }

    const body = await response.text()

    if (!body || body.trim().length === 0) {
      return res.status(200).json({ success: false, error: 'Feed returned no content', items: [] })
    }

    if (body.trimStart().startsWith('<!DOCTYPE') || body.trimStart().startsWith('<html')) {
      return res.status(200).json({ success: false, error: 'Server returned HTML instead of RSS — may be rate-limited', items: [] })
    }

    // Parse RSS items with regex — no dependencies needed
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match
    while ((match = itemRegex.exec(body)) !== null) {
      const block = match[1]
      const getTag = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
          || block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
        return m ? (m[1] || '').trim() : ''
      }
      const getLinkTag = () => {
        // <link> in RSS is tricky — it can be plain text between tags or an href attribute
        const m1 = block.match(/<link>([^<]+)<\/link>/i)
        if (m1) return m1[1].trim()
        const m2 = block.match(/<link[^>]+href=["']([^"']+)["']/i)
        if (m2) return m2[1].trim()
        const m3 = block.match(/<guid[^>]*>([^<]+)<\/guid>/i)
        if (m3) return m3[1].trim()
        return ''
      }
      const title = getTag('title')
      const pubDate = getTag('pubDate') || getTag('dc:date') || getTag('published')
      const link = getLinkTag()
      if (title) items.push({ title, link, pubDate })
    }

    res.status(200).json({ success: true, items })
  } catch (err) {
    console.error('RSS error:', err.message)
    res.status(200).json({ success: false, error: err.message, items: [] })
  }
}
