import React, { useState } from 'react'
import { getStatuses } from '../constants'

const GENRES_PHYSICAL = ['Fantasy','Science Fiction','Mystery','Thriller','Romance','Historical Fiction','Literary Fiction','Horror','Adventure','Non-Fiction','Biography','Self-Help','Science','Philosophy','Poetry','Graphic Novel','Manga','Other']
const GENRES_WEB = ['Xianxia','Wuxia','Cultivation','LitRPG','Progression Fantasy','Isekai','Reincarnation','System','Dungeon','Slice of Life','Romance','Action','Adventure','Sci-Fi','Fantasy','Horror','Comedy','Manhwa','Manga','Web Novel','Other']

export default function BookModal({ book, collection, onClose, onSave, onDelete, allBooks = [] }) {
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
  const [tab, setTab] = useState('basic')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const statuses = getStatuses(collection)
  const genres = collection === 'physical' ? GENRES_PHYSICAL : GENRES_WEB

  const duplicate = isNew && form.title.trim()
    ? allBooks.find(b => b.title.trim().toLowerCase() === form.title.trim().toLowerCase())
    : null

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try { await onSave({ ...form, year: form.year ? parseInt(form.year) : null }); onClose() }
    finally { setSaving(false) }
  }

  const inp = { background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '10px 12px', fontSize: '16px', width: '100%', outline: 'none', boxSizing: 'border-box' }
  const Label = ({ t }) => <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{t}</label>

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>✕</button>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{isNew ? 'Add Book' : 'Edit Book'}</h2>
        <button onClick={handleSave} disabled={!form.title.trim() || saving}
          style={{ color: !form.title.trim() || saving ? 'var(--text-muted)' : 'var(--accent)', fontSize: '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
          {saving ? '...' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
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
                  {duplicate && <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>⚠ "{duplicate.title}" already exists</p>}
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
              <button onClick={() => set('is_favorite', !form.is_favorite)} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: form.is_favorite ? 'rgba(240,192,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_favorite ? 'rgba(240,192,64,0.4)' : 'var(--border)'}`, color: form.is_favorite ? '#f0c040' : 'var(--text-muted)', fontSize: '13px' }}>
                ★ Favorite
              </button>
              <button onClick={() => set('is_r18', !form.is_r18)} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: form.is_r18 ? 'rgba(154,64,64,0.12)' : 'var(--bg-overlay)', border: `1px solid ${form.is_r18 ? 'rgba(154,64,64,0.4)' : 'var(--border)'}`, color: form.is_r18 ? '#ffaaaa' : 'var(--text-muted)', fontSize: '13px' }}>
                R18
              </button>
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
                    <button key={t} onClick={() => set('web_type', t)}
                      style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', background: form.web_type === t ? 'var(--accent)' : 'var(--bg-overlay)', color: form.web_type === t ? '#0a0908' : 'var(--text-muted)', border: `1px solid ${form.web_type === t ? 'var(--accent)' : 'var(--border)'}` }}>
                      {t}
                    </button>
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
            <div><Label t="Tags (comma separated)" /><input style={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. SI, Xianxia, Gamer" /></div>
            <div><Label t="Notes" /><textarea style={{ ...inp, minHeight: '80px', resize: 'none' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Personal notes..." /></div>
          </>
        )}

        {tab === 'tracking' && (
          <>
            <div><Label t="Current Chapter" /><input style={inp} value={form.current_chapter} onChange={e => set('current_chapter', e.target.value)} placeholder="e.g. 42, c14, v7c36" /></div>
            <div><Label t="Total Chapters" /><input style={inp} value={form.total_chapters} onChange={e => set('total_chapters', e.target.value)} placeholder="Total or 'Ongoing'" /></div>
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
