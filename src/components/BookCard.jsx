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

  const fontSize = cardSize === 'compact' ? '10px' : cardSize === 'large' ? '13px' : '11px'
  const authorSize = cardSize === 'compact' ? '9px' : '10px'

  return (
    <div onClick={() => onTap(book)}
      className="relative rounded-xl overflow-hidden active:scale-95 transition-transform cursor-pointer"
      style={{ background: 'var(--bg-card)', border: `1px solid ${book.rss_has_update ? 'rgba(90,154,110,0.5)' : 'var(--border)'}`, aspectRatio: '2/3', display: 'flex', flexDirection: 'column' }}>

      {/* Cover */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        {book.cover_url && !imgErr ? (
          <img src={book.cover_url} alt={book.title} onError={() => setImgErr(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative">
            <img src="/book-cover.png" alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-2">
              <p className="text-center font-semibold leading-tight line-clamp-2" style={{ fontSize: '10px', color: 'rgba(201,135,58,0.9)' }}>{book.title}</p>
            </div>
          </div>
        )}

        {/* RSS badge */}
        {book.rss_has_update && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(90,154,110,0.9)', fontSize: '9px', color: '#fff', fontWeight: '600' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#aef', display: 'inline-block' }} />
            NEW
          </div>
        )}
        {book.is_r18 && !book.rss_has_update && (
          <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded" style={{ background: 'rgba(154,64,64,0.85)', color: '#ffaaaa', fontSize: '8px', fontWeight: '700' }}>R18</div>
        )}
        {book.is_favorite && (
          <div className="absolute top-1.5 right-1.5" style={{ color: '#f0c040', fontSize: '12px' }}>★</div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.8), transparent)' }} />
      </div>

      {/* Info */}
      <div className="px-2 py-1.5 flex-shrink-0" style={{ minHeight: cardSize === 'compact' ? '52px' : '64px' }}>
        <p className="font-semibold truncate leading-tight" style={{ fontSize, color: 'var(--text-primary)' }}>{book.title}</p>
        {book.author && cardSize !== 'compact' && (
          <p className="truncate" style={{ fontSize: authorSize, color: 'var(--text-muted)' }}>{book.author}</p>
        )}

        {/* Tags — show 1 tag max on compact */}
        {tags.length > 0 && cardSize !== 'compact' && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {tags.slice(0, cardSize === 'large' ? 3 : 2).map(tag => (
              <span key={tag} style={{ fontSize: '8px', padding: '1px 4px', borderRadius: '8px', background: 'rgba(201,135,58,0.1)', color: 'var(--accent)', border: '1px solid rgba(201,135,58,0.2)', whiteSpace: 'nowrap' }}>
                {tag}
              </span>
            ))}
            {tags.length > (cardSize === 'large' ? 3 : 2) && (
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>+{tags.length - (cardSize === 'large' ? 3 : 2)}</span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {progress !== null && (
          <div className="mt-1 rounded-full overflow-hidden" style={{ height: '2px', background: 'var(--bg-overlay)' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#5a9a6e' : 'var(--accent)', borderRadius: '9999px' }} />
          </div>
        )}

        <div className="flex items-center justify-between mt-0.5">
          <span style={{ fontSize: '9px', color: statusInfo.color }}>{statusInfo.label}</span>
          <div className="flex items-center gap-1">
            {book.rss_last_item_date && (
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{timeAgo(book.rss_last_item_date)}</span>
            )}
            {book.current_chapter && (
              <button onClick={handleIncrement} className="px-1.5 py-0.5 rounded" style={{ fontSize: '9px', color: '#0a0908', background: 'var(--accent)', fontWeight: '700' }}>+1</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
