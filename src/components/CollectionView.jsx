import React, { useState, useMemo } from 'react'
import BookCard from './BookCard'
import BookModal from './BookModal'
import RssPanel from './RssPanel'
import { getStatuses } from '../constants'

const SORT_OPTIONS = [
  { value: 'rss_date', label: 'Recently Updated' },
  { value: 'updated_at', label: 'Last Modified' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'status', label: 'Status' },
]

const CARD_SIZES = ['compact', 'normal', 'large']
const GRID_COLS = { compact: 4, normal: 3, large: 2 }

export default function CollectionView({ collection, books, loading, add, update, remove, allBooks }) {
  const [modal, setModal] = useState(null)
  const [rssBook, setRssBook] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [sortBy, setSortBy] = useState('rss_date')
  const [showR18, setShowR18] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [cardSize, setCardSize] = useState('normal')

  const statuses = getStatuses(collection)

  // Get unique genres from books
  const genres = useMemo(() => {
    const g = new Set(books.map(b => b.genre).filter(Boolean))
    return [...g].sort()
  }, [books])

  const filtered = useMemo(() => {
    let result = books.filter(b => !b.is_r18 || showR18)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.tags?.toLowerCase().includes(q))
    }
    if (statusFilter) result = result.filter(b => b.status === statusFilter)
    if (genreFilter) result = result.filter(b => b.genre === genreFilter)

    result.sort((a, b) => {
      // NEW badge always first
      if (a.rss_has_update !== b.rss_has_update) return a.rss_has_update ? -1 : 1
      if (sortBy === 'rss_date') {
        const da = a.rss_last_item_date ? new Date(a.rss_last_item_date).getTime() : 0
        const db = b.rss_last_item_date ? new Date(b.rss_last_item_date).getTime() : 0
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return db - da
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return new Date(b.updated_at) - new Date(a.updated_at)
    })
    return result
  }, [books, search, statusFilter, genreFilter, sortBy, showR18])

  const rssCount = books.filter(b => b.rss_has_update).length
  const r18Count = books.filter(b => b.is_r18 && !showR18).length
  // Responsive columns — more on wider screens
  const getResponsiveCols = () => {
    if (typeof window === 'undefined') return GRID_COLS[cardSize]
    const w = window.innerWidth
    const base = GRID_COLS[cardSize] // compact=4, normal=3, large=2
    if (w >= 1280) return base * 4      // xl desktop
    if (w >= 1024) return base * 3      // lg desktop
    if (w >= 768)  return base * 2      // tablet
    return base                          // mobile
  }
  const [cols, setCols] = React.useState(getResponsiveCols)

  React.useEffect(() => {
    const handle = () => setCols(getResponsiveCols())
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [cardSize])

  const handleCardTap = (book) => {
    if (book.rss_feed_url) setRssBook(book)
    else setModal({ book })
  }

  const handleSave = async (data) => {
    if (data.id && books.find(b => b.id === data.id)) await update(data.id, data)
    else await add(data)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-3 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {showSearch ? (
          <div className="flex items-center gap-2">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search title, author, tags..."
              style={{ flex: 1, background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', padding: '8px 12px', fontSize: '16px', outline: 'none' }} />
            <button onClick={() => { setSearch(''); setShowSearch(false) }} style={{ color: 'var(--accent)', fontSize: '14px', whiteSpace: 'nowrap' }}>Done</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length}</span>
              {rssCount > 0 && <span style={{ fontSize: '11px', background: 'rgba(90,154,110,0.15)', color: '#5a9a6e', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(90,154,110,0.3)' }}>{rssCount} new</span>}
              {r18Count > 0 && <button onClick={() => setShowR18(v => !v)} style={{ fontSize: '11px', background: 'rgba(154,64,64,0.1)', color: '#ffaaaa', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(154,64,64,0.3)' }}>+{r18Count} R18</button>}
            </div>
            <div className="flex items-center gap-2">
              {/* Card size */}
              <button onClick={() => setCardSize(s => CARD_SIZES[(CARD_SIZES.indexOf(s) + 1) % CARD_SIZES.length])}
                style={{ color: 'var(--text-muted)', fontSize: '18px', padding: '2px', lineHeight: 1 }} title={`Card size: ${cardSize}`}>
                ⊞
              </button>
              <button onClick={() => setShowFilters(v => !v)} style={{ color: showFilters ? 'var(--accent)' : 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 9h10M10 14h4" />
                </svg>
              </button>
              <button onClick={() => setShowSearch(true)} style={{ color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              <button onClick={() => setModal({ isNew: true })} style={{ color: 'var(--accent)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex-shrink-0 px-3 py-2 space-y-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {/* Sort */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setSortBy(s.value)}
                style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', whiteSpace: 'nowrap', background: sortBy === s.value ? 'rgba(201,135,58,0.15)' : 'var(--bg-overlay)', color: sortBy === s.value ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${sortBy === s.value ? 'rgba(201,135,58,0.4)' : 'var(--border)'}`, flexShrink: 0 }}>
                {s.label}
              </button>
            ))}
          </div>
          {/* Status */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setStatusFilter('')} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', whiteSpace: 'nowrap', background: !statusFilter ? 'rgba(201,135,58,0.15)' : 'var(--bg-overlay)', color: !statusFilter ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${!statusFilter ? 'rgba(201,135,58,0.4)' : 'var(--border)'}`, flexShrink: 0 }}>All</button>
            {statuses.map(s => (
              <button key={s.value} onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
                style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', whiteSpace: 'nowrap', background: statusFilter === s.value ? s.color + '22' : 'var(--bg-overlay)', color: statusFilter === s.value ? s.color : 'var(--text-muted)', border: `1px solid ${statusFilter === s.value ? s.color + '66' : 'var(--border)'}`, flexShrink: 0 }}>
                {s.label}
              </button>
            ))}
          </div>
          {/* Genre */}
          {genres.length > 0 && (
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setGenreFilter('')} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', whiteSpace: 'nowrap', background: !genreFilter ? 'rgba(201,135,58,0.15)' : 'var(--bg-overlay)', color: !genreFilter ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${!genreFilter ? 'rgba(201,135,58,0.4)' : 'var(--border)'}`, flexShrink: 0 }}>Any genre</button>
              {genres.map(g => (
                <button key={g} onClick={() => setGenreFilter(genreFilter === g ? '' : g)}
                  style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', whiteSpace: 'nowrap', background: genreFilter === g ? 'rgba(201,135,58,0.15)' : 'var(--bg-overlay)', color: genreFilter === g ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${genreFilter === g ? 'rgba(201,135,58,0.4)' : 'var(--border)'}`, flexShrink: 0 }}>
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scroll-area px-3 pb-4">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: gridStyle, gap: '10px', paddingTop: '10px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '2/3', background: 'var(--bg-card)', borderRadius: '12px', opacity: 0.4 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{search || statusFilter || genreFilter ? 'No matches' : 'No books yet'}</p>
            {!search && !statusFilter && !genreFilter && (
              <button onClick={() => setModal({ isNew: true })} style={{ color: 'var(--accent)', fontSize: '14px' }}>Add your first book →</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: gridStyle, gap: '10px', paddingTop: '10px' }}>
            {filtered.map(book => (
              <BookCard key={book.id} book={book} collection={collection}
                cardSize={cardSize}
                onTap={handleCardTap}
                onIncrement={(id, ch) => update(id, { current_chapter: ch })} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-40 slide-up">
          <BookModal
            book={modal.isNew ? null : modal.book}
            collection={collection}
            onClose={() => setModal(null)}
            onSave={handleSave}
            onDelete={remove}
            allBooks={allBooks}
          />
        </div>
      )}

      {rssBook && (
        <div className="fixed inset-0 z-40">
          <RssPanel book={rssBook} onClose={() => setRssBook(null)} />
        </div>
      )}
    </div>
  )
}
