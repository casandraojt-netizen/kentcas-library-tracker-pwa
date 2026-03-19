import React, { useState } from 'react'
import { getStatuses } from '../constants'

const GENRES_PHYSICAL = ['Fantasy','Science Fiction','Mystery','Thriller','Romance','Historical Fiction','Literary Fiction','Horror','Adventure','Non-Fiction','Biography','Self-Help','Science','Philosophy','Poetry','Graphic Novel','Manga','Other']
const GENRES_WEB = ['Xianxia','Wuxia','Cultivation','LitRPG','Progression Fantasy','Isekai','Reincarnation','System','Dungeon','Slice of Life','Romance','Action','Adventure','Sci-Fi','Fantasy','Horror','Comedy','Manhwa','Manga','Web Novel','Other']
const TAG_SUGGESTIONS = ['SI','Self-Insert','OC','Gamer','System','Cultivation','Xianxia','LitRPG','Isekai','Reincarnation','Progression','Dark','Comedy','Wholesome','Romance','Completed','Ongoing','Crossover','AU']

export default function BookModal({ book, collection, onClose, onSave, onDelete, onOpenRss, allBooks = [] }) {
  const isNew = !book?.id
  const [form, setForm] = useState({
    title: '', author: '', cover_url: '', genre: '', status: 'unread',
    current_chapter: '', total_chapters: '', year: '', notes: '',
    source_url: '', rss_feed_url: '', tags: '', is_favorite: false,
    is_r18: false, web_type: 'novel', collection,
    ...(book || {}),
    year: book?.year ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDupe, setConfirmDupe] = useState(null)
  const [tab, setTab] = useState('basic')
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const statuses = getStatuses(collection)
  const genres = collection === 'physical' ? GENRES_PHYSICAL : GENRES_WEB
  const tagList = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  const findDuplicate = () => {
    if (!isNew) return null
    if (form.title.trim()) {
      const m = allBooks.find(b => b.title.trim().toLowerCase() === form.title.trim().toLowerCase())
      if (m) return { field: 'title', book: m }
    }
    if (form.rss_feed_url.trim()) {
      const m = allBooks.find(b => b.rss_feed_url && b.rss_feed_url.trim() === form.rss_feed_url.trim())
      if (m) return { field: 'RSS feed URL', book: m }
    }
    if (form.source_url.trim()) {
      const m = allBooks.find(b => b.source_url && b.source_url.trim() === form.source_url.trim())
      if (m) return { field: 'source URL', book: m }
    }
    return null
  }

  const doSave = async () => {
    setSaving(true)
    try { await onSave({ ...form, year: form.year ? parseInt(form.year) : null }); onClose() }
    finally { setSaving(false) }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    if (isNew && !confirmDupe) {
      const dupe = findDuplicate()
      if (dupe) { setConfirmDupe(dupe); return }
    }
    await doSave()
  }

  const addTag = (tag) => {
    const t = tag.trim()
    if (!t || tagList.includes(t)) { setTagInput(''); return }
    set('tags', [...tagList, t].join(', '))
    setTagInput(''); setShowSuggestions(false)
  }
  const removeTag = (tag) => set('tags', tagList.filter(t => t !== tag).join(', '))
  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
    else if (e.key === 'Backspace' && !tagInput && tagList.length) removeTag(tagList[tagList.length - 1])
  }
  const filteredSuggestions = tagInput.trim()
    ? TAG_SUGGESTIONS.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tagList.includes(t)).slice(0, 5)
    : []

  const inp = { background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '10px 12px', fontSize: '16px', width: '100%', outline: 'none', boxSizing: 'border-box' }
  const Label = ({ t }) => <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{t}</label>

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>✕</button>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{isNew ? 'Add Book' : 'Edit Book'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isNew && form.rss_feed_url && onOpenRss && (
            <button onClick={() => { onClose(); onOpenRss(book) }}
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }} title="Open RSS Feed">
              📡
            </button>
          )}
          <button onClick={handleSave} disabled={!form.title.trim() || saving}
            style={{ color: !form.title.trim() || saving ? 'var(--text-muted)' : 'var(--accent)', fontSize: '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
            {saving ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Duplicate warning */}
      {confirmDupe && (
        <div style={{ flexShrink: 0, padding: '12px 16px', background: 'rgba(201,135,58,0.1)', borderBottom: '1px solid rgba(201,135,58,0.3)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>
            ⚠ Same {confirmDupe.field} as existing book: <strong>"{confirmDupe.book.title}"</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmDupe(null)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            <button onClick={doSave} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--accent)', color: '#0a0908', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Add Anyway</button>
          </div>
        </div>
      )}

      <div style={{ flexShrink: 0, display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {['basic', 'details', 'tracking'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '10px 0', textTransform: 'capitalize', fontSize: '13px', color: tab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', fontWeight: tab === t ? '600' : '400', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tab === 'basic' && (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexShrink: 0, width: '80px', height: '112px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-overlay)' }}>
                <img src={form.cover_url || '/book-cover.png'} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = '/book-cover.png' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <Label t="Title *" />
                  <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" />
                </div>
                <div>
                  <Label t="Author" />
                  <input style={inp} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />
                </div>
              </div>
            </div>
            <div><Label t="Cover Image URL" /><input style={inp} value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." /></div>
            <div>
              <Label t="Status" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {statuses.map(s => (
                  <button key={s.value} onClick={() => set('status', s.value)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', background: form.status === s.value ? s.color + '22' : 'var(--bg-overlay)', color: form.status === s.value ? s.color : 'var(--text-muted)', border: `1px solid ${form.status === s.value ? s.color + '66' : 'var(--border)'}` }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label t="Genre" />
              <select style={inp} value={form.genre} onChange={e => set('genre', e.target.value)}>
                <option value="">Select genre</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => set('is_favorite', !form.is_favorite)} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: form.is_favorite ? 'rgba(240,192,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_favorite ? 'rgba(240,192,64,0.4)' : 'var(--border)'}`, color: form.is_favorite ? '#f0c040' : 'var(--text-muted)', fontSize: '13px' }}>★ Favorite</button>
              <button onClick={() => set('is_r18', !form.is_r18)} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: form.is_r18 ? 'rgba(154,64,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_r18 ? 'rgba(154,64,64,0.4)' : 'var(--border)'}`, color: form.is_r18 ? '#ffaaaa' : 'var(--text-muted)', fontSize: '13px' }}>R18</button>
            </div>
          </>
        )}

        {tab === 'details' && (
          <>
            <div><Label t="Year Published" /><input style={inp} type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="e.g. 2020" /></div>
            {collection === 'web' && <>
              <div>
                <Label t="Type" />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['novel','comic','manhwa','manga'].map(t => (
                    <button key={t} onClick={() => set('web_type', t)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', background: form.web_type === t ? 'var(--accent)' : 'var(--bg-overlay)', color: form.web_type === t ? '#0a0908' : 'var(--text-muted)', border: `1px solid ${form.web_type === t ? 'var(--accent)' : 'var(--border)'}` }}>{t}</button>
                  ))}
                </div>
              </div>
              <div><Label t="Source URL" /><input style={inp} value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://..." /></div>
              <div>
                <Label t="RSS Feed URL" />
                <input style={inp} value={form.rss_feed_url} onChange={e => set('rss_feed_url', e.target.value)} placeholder=".../threadmarks.rss?threadmark_category=1" />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>SpaceBattles/SV threadmarks RSS URL</p>
              </div>
            </>}
            <div>
              <Label t="Tags" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', borderRadius: '10px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', minHeight: '44px', cursor: 'text' }}>
                {tagList.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(201,135,58,0.15)', color: 'var(--accent)', fontSize: '12px', border: '1px solid rgba(201,135,58,0.3)' }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
                <input value={tagInput}
                  onChange={e => { setTagInput(e.target.value); setShowSuggestions(true) }}
                  onKeyDown={handleTagKey}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={tagList.length === 0 ? 'Type a tag, press Enter...' : ''}
                  style={{ flex: 1, minWidth: '120px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
                  {filteredSuggestions.map(s => (
                    <button key={s} onClick={() => addTag(s)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <div><Label t="Notes" /><textarea style={{ ...inp, minHeight: '80px', resize: 'none' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Personal notes..." /></div>
          </>
        )}

        {tab === 'tracking' && (
          <>
            <div><Label t="Current Chapter" /><input style={inp} value={form.current_chapter} onChange={e => set('current_chapter', e.target.value)} placeholder="e.g. 42, c14, v7c36" /></div>
            <div><Label t="Total Chapters" /><input style={inp} value={form.total_chapters} onChange={e => set('total_chapters', e.target.value)} placeholder="Total or 'Ongoing'" /></div>
            {form.current_chapter && form.total_chapters && !isNaN(parseFloat(form.current_chapter)) && !isNaN(parseFloat(form.total_chapters)) && (
              <div style={{ background: 'var(--bg-overlay)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{Math.round((parseFloat(form.current_chapter) / parseFloat(form.total_chapters)) * 100)}%</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (parseFloat(form.current_chapter) / parseFloat(form.total_chapters)) * 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: '9999px' }} />
                </div>
              </div>
            )}
          </>
        )}

        {!isNew && (
          <button onClick={async () => { if (!confirmDelete) { setConfirmDelete(true); return } await onDelete(book.id); onClose() }}
            style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', color: confirmDelete ? '#f0a0a0' : 'var(--text-muted)', background: confirmDelete ? 'rgba(154,64,64,0.15)' : 'var(--bg-overlay)', border: '1px solid var(--border)', fontSize: '14px', marginTop: '8px' }}>
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete Book'}
          </button>
        )}
      </div>
    </div>
  )
}
