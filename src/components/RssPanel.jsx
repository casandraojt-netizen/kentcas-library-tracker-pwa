import React, { useState, useEffect } from 'react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 30) return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export default function RssPanel({ book, onClose }) {
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
    } catch (e) {
      setError('Failed to load feed: ' + e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col slide-up" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }} className="truncate">{book.title}</p>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '10px', height: '10px', color: 'var(--accent)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>RSS Feed · {items.length} chapters</span>
          </div>
        </div>
        <button onClick={loadFeed} style={{ color: 'var(--text-muted)', padding: '4px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scroll-area">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading feed...</p>
          </div>
        )}
        {error && !loading && (
          <div className="p-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)' }}>
              <p style={{ fontSize: '13px', color: '#f0a0a0' }}>{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-3 px-4 py-3.5 active:bg-opacity-50"
            style={{ borderBottom: '1px solid var(--border)', display: 'flex', textDecoration: 'none', background: 'transparent' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {i === 0 && <span style={{ fontSize: '9px', background: 'rgba(201,135,58,0.2)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0, fontWeight: '600' }}>LATEST</span>}
                <p style={{ fontSize: '14px', fontWeight: '500', color: i === 0 ? 'var(--accent-light)' : 'var(--text-primary)' }} className="truncate">{item.title}</p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(item.pubDate)}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
