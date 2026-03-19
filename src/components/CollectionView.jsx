import React, { useState, useMemo } from 'react'
import BookCard from './BookCard'
import BookModal from './BookModal'

export default function CollectionView({ collection, books, loading, add, update, remove, allBooks }) {
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showR18, setShowR18] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const filtered = useMemo(() => {
    let result = books.filter(b => !b.is_r18 || showR18)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q))
    }
    if (statusFilter) result = result.filter(b => b.status === statusFilter)
    return result
  }, [books, search, statusFilter, showR18])

  const rssCount = books.filter(b => b.rss_has_update).length
  const r18Count = books.filter(b => b.is_r18 && !showR18).length

  const handleSave = async (data) => {
    if (data.id && books.find(b => b.id === data.id)) await update(data.id, data)
    else await add(data)
  }

  const statusChips = ['', 'reading', 'finished', 'unread', 'waiting', 'dropped', 'hiatus', 'abandoned']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ flexShrink: 0, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {showSearch ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ flex: 1, background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', padding: '8px 12px', fontSize: '16px', outline: 'none' }} />
            <button onClick={() => { setSearch(''); setShowSearch(false) }}
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>Done</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} books</span>
              {rssCount > 0 && <span style={{ fontSize: '11px', background: 'rgba(90,154,110,0.15)', color: '#5a9a6e', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(90,154,110,0.3)' }}>{rssCount} new</span>}
              {r18Count > 0 && <button onClick={() => setShowR18(v => !v)} style={{ fontSize: '11px', background: 'rgba(154,64,64,0.1)', color: '#ffaaaa', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(154,64,64,0.3)', cursor: 'pointer' }}>+{r18Count} R18</button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setShowSearch(true)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              <button onClick={() => setModal({ isNew: true })} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status chips */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '6px', padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--border)' }}>
        {statusChips.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', background: statusFilter === s ? 'rgba(201,135,58,0.15)' : 'var(--bg-overlay)', color: statusFilter === s ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${statusFilter === s ? 'rgba(201,135,58,0.4)' : 'var(--border)'}` }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="scroll-area" style={{ flex: 1, padding: '10px 12px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '2/3', background: 'var(--bg-card)', borderRadius: '12px', opacity: 0.4 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{search || statusFilter ? 'No matches' : 'No books yet'}</p>
            {!search && !statusFilter && <button onClick={() => setModal({ isNew: true })} style={{ color: 'var(--accent)', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>Add your first book →</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {filtered.map(book => (
              <BookCard key={book.id} book={book} collection={collection}
                onTap={b => setModal({ book: b })}
                onIncrement={(id, ch) => update(id, { current_chapter: ch })} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
          <BookModal book={modal.isNew ? null : modal.book} collection={collection}
            onClose={() => setModal(null)} onSave={handleSave} onDelete={remove} allBooks={allBooks} />
        </div>
      )}
    </div>
  )
}
