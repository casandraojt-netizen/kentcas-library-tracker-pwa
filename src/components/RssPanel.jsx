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

export default function RssPanel({ book, onClose, onMarkRead }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!book.rss_feed_url) { setLoading(false); setError('No RSS feed URL set for this book.'); return }
    loadFeed()
  }, [book.id])

  const loadFeed = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: book.rss_feed_url }),
      })
      const data = await res.json()
      if (data.success) setItems(data.items || [])
      else setError(data.error || 'Failed to load feed')
    } catch (e) { setError('Failed to load: ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
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
        {error && !loading && (
          <div style={{ padding: '16px' }}>
            <div style={{ background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '13px', color: '#f0a0a0' }}>{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', background: 'transparent' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                {i === 0 && <span style={{ fontSize: '9px', background: 'rgba(201,135,58,0.2)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0, fontWeight: '600' }}>LATEST</span>}
                <p style={{ fontSize: '14px', fontWeight: '500', color: i === 0 ? 'var(--accent-light)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.title}</p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{timeAgo(item.pubDate)}</p>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '16px', flexShrink: 0 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
