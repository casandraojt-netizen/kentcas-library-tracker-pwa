import React, { useState } from 'react'
import { getStatuses } from '../constants'

const GENRES_PHYSICAL = ['Fantasy','Science Fiction','Mystery','Thriller','Romance','Historical Fiction','Literary Fiction','Horror','Adventure','Non-Fiction','Biography','Self-Help','Science','Philosophy','Poetry','Graphic Novel','Manga','Other']
const GENRES_WEB = ['Xianxia','Wuxia','Cultivation','LitRPG','Progression Fantasy','Isekai','Reincarnation','System','Dungeon','Slice of Life','Romance','Action','Adventure','Sci-Fi','Fantasy','Horror','Comedy','Manhwa','Manga','Web Novel','Other']

const TAG_SUGGESTIONS = ['SI','Self-Insert','OC','Gamer','System','Cultivation','Xianxia','LitRPG','Isekai','Reincarnation','Progression','Dark','Comedy','Wholesome','Romance','Harem','Completed','Ongoing','Hiatus','Crossover','AU','Fix-It','Long','Epic']

export default function BookModal({ book, collection, onClose, onSave, onDelete, allBooks = [] }) {
  const isNew = !book?.id
  const [form, setForm] = useState(() => ({
    title: '', author: '', cover_url: '', genre: '', status: 'unread',
    current_chapter: '', total_chapters: '', year: '', notes: '',
    source_url: '', rss_feed_url: '', tags: '', is_favorite: false,
    is_r18: false, web_type: 'novel', collection,
    ...book, year: book?.year ?? '',
  }))
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDupe, setConfirmDupe] = useState(false)
  const [tab, setTab] = useState('basic')
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const statuses = getStatuses(collection)
  const genres = collection === 'physical' ? GENRES_PHYSICAL : GENRES_WEB
  const tagList = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  // Duplicate detection — check title, rss_feed_url, source_url
  const findDuplicate = () => {
    if (!isNew) return null
    const titleMatch = form.title.trim() && allBooks.find(b =>
      b.title.trim().toLowerCase() === form.title.trim().toLowerCase())
    if (titleMatch) return { field: 'title', book: titleMatch }
    const rssMatch = form.rss_feed_url.trim() && allBooks.find(b =>
      b.rss_feed_url && b.rss_feed_url.trim() === form.rss_feed_url.trim())
    if (rssMatch) return { field: 'RSS feed URL', book: rssMatch }
    const sourceMatch = form.source_url.trim() && allBooks.find(b =>
      b.source_url && b.source_url.trim() === form.source_url.trim())
    if (sourceMatch) return { field: 'source URL', book: sourceMatch }
    return null
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    if (isNew && !confirmDupe) {
      const dupe = findDuplicate()
      if (dupe) { setConfirmDupe(dupe); return }
    }
    setSaving(true)
    try { await onSave({ ...form, year: form.year ? parseInt(form.year) : null }); onClose() }
    finally { setSaving(false) }
  }

  const addTag = (tag) => {
    const t = tag.trim()
    if (!t || tagList.includes(t)) { setTagInput(''); return }
    set('tags', [...tagList, t].join(', '))
    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tag) => set('tags', tagList.filter(t => t !== tag).join(', '))

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
    else if (e.key === 'Backspace' && !tagInput && tagList.length) removeTag(tagList[tagList.length - 1])
  }

  const filteredSuggestions = tagInput.trim()
    ? TAG_SUGGESTIONS.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tagList.includes(t)).slice(0, 5)
    : []

  const inputStyle = { background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '10px 12px', fontSize: '16px', width: '100%', outline: 'none' }
  const Label = ({ children }) => <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{children}</label>

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px', fontSize: '22px' }}>✕</button>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {isNew ? 'Add Book' : 'Edit Book'}
        </h2>
        <button onClick={handleSave} disabled={!form.title.trim() || saving}
          style={{ color: saving || !form.title.trim() ? 'var(--text-muted)' : 'var(--accent)', fontSize: '16px', fontWeight: '600', padding: '4px' }}>
          {saving ? '...' : 'Save'}
        </button>
      </div>

      {/* Duplicate warning */}
      {confirmDupe && (
        <div className="flex-shrink-0 px-4 py-3" style={{ background: 'rgba(201,135,58,0.1)', borderBottom: '1px solid rgba(201,135,58,0.3)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>
            ⚠ Possible duplicate — a book with the same {confirmDupe.field} already exists: <strong>"{confirmDupe.book.title}"</strong>
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDupe(false)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-overlay)', color: 'var(--text-secondary)', fontSize: '13px' }}>Cancel</button>
            <button onClick={async () => { setConfirmDupe(false); setSaving(true); try { await onSave({ ...form, year: form.year ? parseInt(form.year) : null }); onClose() } finally { setSaving(false) } }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--accent)', color: '#0a0908', fontSize: '13px', fontWeight: '600' }}>
              Add Anyway
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {['basic', 'details', 'tracking'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 capitalize"
            style={{ fontSize: '13px', color: tab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', fontWeight: tab === t ? '600' : '400' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-4 py-4 space-y-4">
        {tab === 'basic' && (
          <>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                {form.cover_url
                  ? <img src={form.cover_url} alt="cover" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  : <img src="/book-cover.png" alt="cover" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Title *</Label>
                  <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" />
                </div>
                <div>
                  <Label>Author</Label>
                  <input style={inputStyle} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />
                </div>
              </div>
            </div>

            <div>
              <Label>Cover Image URL</Label>
              <input style={inputStyle} value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button key={s.value} onClick={() => set('status', s.value)}
                    style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', background: form.status === s.value ? s.color + '22' : 'var(--bg-overlay)', color: form.status === s.value ? s.color : 'var(--text-muted)', border: `1px solid ${form.status === s.value ? s.color + '66' : 'var(--border)'}` }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Genre</Label>
              <select style={inputStyle} value={form.genre} onChange={e => set('genre', e.target.value)}>
                <option value="">Select genre</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => set('is_favorite', !form.is_favorite)} className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                style={{ background: form.is_favorite ? 'rgba(240,192,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_favorite ? 'rgba(240,192,64,0.4)' : 'var(--border)'}`, color: form.is_favorite ? '#f0c040' : 'var(--text-muted)', fontSize: '13px' }}>
                ★ Favorite
              </button>
              <button onClick={() => set('is_r18', !form.is_r18)} className="flex-1 py-2.5 rounded-xl flex items-center justify-center"
                style={{ background: form.is_r18 ? 'rgba(154,64,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_r18 ? 'rgba(154,64,64,0.4)' : 'var(--border)'}`, color: form.is_r18 ? '#ffaaaa' : 'var(--text-muted)', fontSize: '13px' }}>
                R18
              </button>
            </div>
          </>
        )}

        {tab === 'details' && (
          <>
            <div>
              <Label>Year Published</Label>
              <input style={inputStyle} type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="e.g. 2020" />
            </div>
            {collection === 'web' && (
              <>
                <div>
                  <Label>Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {['novel','comic','manhwa','manga'].map(t => (
                      <button key={t} onClick={() => set('web_type', t)}
                        style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', background: form.web_type === t ? 'var(--accent)' : 'var(--bg-overlay)', color: form.web_type === t ? '#0a0908' : 'var(--text-muted)', border: `1px solid ${form.web_type === t ? 'var(--accent)' : 'var(--border)'}` }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Source URL</Label>
                  <input style={inputStyle} value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <Label>RSS Feed URL</Label>
                  <input style={inputStyle} value={form.rss_feed_url} onChange={e => set('rss_feed_url', e.target.value)} placeholder=".../threadmarks.rss?threadmark_category=1" />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>SpaceBattles/SV threadmarks RSS URL</p>
                </div>
              </>
            )}

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl mb-2" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', minHeight: '44px' }}>
                {tagList.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,135,58,0.15)', color: 'var(--accent)', fontSize: '12px', border: '1px solid rgba(201,135,58,0.3)' }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ color: 'var(--accent)', fontSize: '14px', lineHeight: 1 }}>×</button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true) }}
                  onKeyDown={handleTagKey} onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                  placeholder={tagList.length === 0 ? 'Type a tag, press Enter...' : ''}
                  style={{ flex: 1, minWidth: '120px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '2px 4px' }} />
              </div>
              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', marginTop: '-8px' }}>
                  {filteredSuggestions.map(s => (
                    <button key={s} onClick={() => addTag(s)} className="w-full text-left px-3 py-2"
                      style={{ fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Personal notes..." />
            </div>
          </>
        )}

        {tab === 'tracking' && (
          <>
            <div>
              <Label>Current Chapter</Label>
              <input style={inputStyle} value={form.current_chapter} onChange={e => set('current_chapter', e.target.value)} placeholder="e.g. 42, c14, v7c36" />
            </div>
            <div>
              <Label>Total Chapters</Label>
              <input style={inputStyle} value={form.total_chapters} onChange={e => set('total_chapters', e.target.value)} placeholder="Total or 'Ongoing'" />
            </div>
            {form.current_chapter && form.total_chapters && !isNaN(parseFloat(form.current_chapter)) && !isNaN(parseFloat(form.total_chapters)) && (
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{Math.round((parseFloat(form.current_chapter) / parseFloat(form.total_chapters)) * 100)}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'var(--border)' }}>
                  <div style={{ width: `${Math.min(100, (parseFloat(form.current_chapter) / parseFloat(form.total_chapters)) * 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: '9999px' }} />
                </div>
              </div>
            )}
          </>
        )}

        {!isNew && (
          <div className="pt-2">
            <button onClick={async () => { if (!confirmDelete) { setConfirmDelete(true); return } await onDelete(book.id); onClose() }}
              className="w-full py-3 rounded-xl"
              style={{ color: confirmDelete ? '#f0a0a0' : 'var(--text-muted)', background: confirmDelete ? 'rgba(154,64,64,0.15)' : 'var(--bg-overlay)', border: '1px solid var(--border)', fontSize: '14px' }}>
              {confirmDelete ? 'Tap again to confirm delete' : 'Delete Book'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
