import React, { useState, useEffect } from 'react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 30) return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

function parseRssItems(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const getTag = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
      return m ? (m[1] || '').trim() : ''
    }
    const getLinkTag = () => {
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
  return items
}

function ChapterRow({ title, link, pubDate, isLatest }) {
  const inner = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
        {isLatest && <span style={{ fontSize: '9px', background: 'rgba(201,135,58,0.2)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0, fontWeight: '600' }}>LATEST</span>}
        <p style={{ fontSize: '14px', fontWeight: '500', color: isLatest ? 'var(--accent-light)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{title}</p>
      </div>
      {pubDate && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{timeAgo(pubDate)}</p>}
    </div>
  )

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
        {inner}
        <span style={{ color: 'var(--text-muted)', fontSize: '16px', flexShrink: 0 }}>↗</span>
      </a>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      {inner}
    </div>
  )
}

export default function RssPanel({ book, onClose, onMarkRead }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!book.rss_feed_url) { setLoading(false); setError('No RSS feed URL set.'); return }
    loadFeed()
  }, [book.id])

  const loadFeed = async () => {
    setLoading(true); setError('')
    try {
      // Fetch directly from the browser — uses your device's IP, not a server
      // This bypasses SB/SV/QQ bot protection since mobile/home IPs aren't blocked
      const response = await fetch(book.rss_feed_url, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      if (!response.ok) {
        // If direct fetch fails, fall back to Vercel proxy
        console.log(`Direct fetch failed (${response.status}), trying proxy...`)
        await loadViaProxy()
        return
      }

      const text = await response.text()
      if (!text || text.trim().length === 0) {
        await loadViaProxy()
        return
      }
      if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
        await loadViaProxy()
        return
      }

      const parsed = parseRssItems(text)
      if (parsed.length === 0) {
        await loadViaProxy()
        return
      }

      setItems(parsed)
    } catch (e) {
      // CORS error or network error — fall back to proxy
      console.log('Direct fetch error, trying proxy:', e.message)
      await loadViaProxy()
    } finally {
      setLoading(false)
    }
  }

  const loadViaProxy = async () => {
    try {
      const res = await fetch('/api/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: book.rss_feed_url }),
      })
      const data = await res.json()
      if (data.success && data.items.length > 0) {
        setItems(data.items)
      } else {
        // Both direct and proxy failed — show stored data
        setError(data.error || 'Could not load feed')
        setItems([])
      }
    } catch (e) {
      setError('Could not load feed: ' + e.message)
      setItems([])
    }
  }

  const hasStoredData = book.rss_last_item_title
  const storedUrl = book.rss_last_item_url || book.source_url || ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{book.title}</p>
          <p style={{ fontSize: '11px', color: 'var(--accent)', margin: 0 }}>RSS Feed · {items.length} chapters</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {book.rss_has_update && onMarkRead && (
            <button onClick={() => { onMarkRead(book.id); onClose() }}
              style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(90,154,110,0.15)', border: '1px solid rgba(90,154,110,0.4)', color: '#5a9a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ✓ Mark Read
            </button>
          )}
          <button onClick={loadFeed} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>↻</button>
        </div>
      </div>

      <div className="scroll-area" style={{ flex: 1 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading feed...</p>
          </div>
        )}

        {/* Error with stored fallback */}
        {!loading && error && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '13px', color: '#f0a0a0', margin: 0 }}>{error}</p>
            </div>
            {hasStoredData && (
              <>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Last known chapter (synced from desktop):</p>
                <ChapterRow title={book.rss_last_item_title} link={storedUrl} pubDate={book.rss_last_item_date} isLatest={true} />
              </>
            )}
            {book.source_url && (
              <a href={book.source_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', textDecoration: 'none' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>Open story page ↗</p>
              </a>
            )}
          </div>
        )}

        {/* Live chapters */}
        {!loading && !error && items.map((item, i) => (
          <ChapterRow key={i} title={item.title} link={item.link} pubDate={item.pubDate} isLatest={i === 0} />
        ))}
      </div>
    </div>
  )
}
