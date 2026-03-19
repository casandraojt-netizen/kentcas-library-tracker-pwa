import React, { useState } from 'react'
import { getStatuses } from '../constants'

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 60) return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

export default function BookCard({ book, collection, onTap, onIncrement, cardSize = 'normal' }) {
  const [imgErr, setImgErr] = useState(false)
  const statuses = getStatuses(collection)
  const statusInfo = statuses.find(s => s.value === book.status) || statuses[0]
  const cur = parseFloat(book.current_chapter)
  const tot = parseFloat(book.total_chapters)
  const progress = !isNaN(cur) && !isNaN(tot) && tot > 0 ? Math.min(100, (cur / tot) * 100) : null
  const tags = book.tags ? book.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  const handleIncrement = async (e) => {
    e.stopPropagation()
    const chapter = book.current_chapter || '0'
    const incremented = chapter.replace(/(\d+)(?!.*\d)/, n => String(parseInt(n) + 1))
    await onIncrement(book.id, incremented)
  }

  const titleSize = cardSize === 'compact' ? '10px' : cardSize === 'large' ? '13px' : '11px'

  return (
    <div onClick={() => onTap(book)}
      style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-card)', border: `1px solid ${book.rss_has_update ? 'rgba(90,154,110,0.5)' : 'var(--border)'}`, aspectRatio: '2/3', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {book.cover_url && !imgErr ? (
          <img src={book.cover_url} alt={book.title} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img src="/book-cover.png" alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '16px', padding: '0 8px 16px' }}>
              <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(201,135,58,0.9)', fontWeight: '600', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</p>
            </div>
          </div>
        )}
        {book.rss_has_update && (
          <div style={{ position: 'absolute', top: '6px', left: '6px', padding: '2px 6px', borderRadius: '9999px', background: 'rgba(90,154,110,0.9)', fontSize: '9px', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#aef', display: 'inline-block' }} />
            NEW
          </div>
        )}
        {book.is_r18 && (
          <div style={{ position: 'absolute', top: '6px', left: book.rss_has_update ? 'auto' : '6px', right: book.rss_has_update ? '6px' : 'auto', padding: '1px 4px', borderRadius: '4px', background: 'rgba(154,64,64,0.85)', color: '#ffaaaa', fontSize: '8px', fontWeight: '700' }}>R18</div>
        )}
        {book.is_favorite && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#f0c040', fontSize: '12px' }}>★</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '32px', background: 'linear-gradient(to top, rgba(10,9,8,0.8), transparent)', pointerEvents: 'none' }} />
      </div>

      <div style={{ padding: '6px 8px', flexShrink: 0 }}>
        <p style={{ fontSize: titleSize, fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, margin: 0 }}>{book.title}</p>
        {book.author && cardSize !== 'compact' && (
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{book.author}</p>
        )}
        {tags.length > 0 && cardSize === 'large' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '3px' }}>
            {tags.slice(0, 2).map(tag => (
              <span key={tag} style={{ fontSize: '8px', padding: '1px 4px', borderRadius: '8px', background: 'rgba(201,135,58,0.1)', color: 'var(--accent)', border: '1px solid rgba(201,135,58,0.2)', whiteSpace: 'nowrap' }}>{tag}</span>
            ))}
          </div>
        )}
        {progress !== null && (
          <div style={{ marginTop: '3px', borderRadius: '9999px', overflow: 'hidden', height: '2px', background: 'var(--bg-overlay)' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#5a9a6e' : 'var(--accent)', borderRadius: '9999px' }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
          <span style={{ fontSize: '9px', color: statusInfo.color }}>{statusInfo.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {book.rss_last_item_date && cardSize !== 'compact' && (
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{timeAgo(book.rss_last_item_date)}</span>
            )}
            {book.current_chapter && (
              <button onClick={handleIncrement} style={{ fontSize: '9px', color: '#0a0908', background: 'var(--accent)', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>+1</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
