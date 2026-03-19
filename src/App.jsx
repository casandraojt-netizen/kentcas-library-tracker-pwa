import React, { useState, useEffect } from 'react'
import { getNeonUrl, hasNeonUrl, clearNeonUrl } from './db'
import { useBooks } from './hooks/useBooks'
import CollectionView from './components/CollectionView'
import Setup from './components/Setup'

const TABS = ['physical', 'web', 'stats', 'settings']

function StatsView({ physical, web }) {
  const all = [...physical, ...web]
  const stats = [
    { label: 'Total', value: all.length, color: 'var(--accent)' },
    { label: 'Reading', value: all.filter(b => b.status === 'reading').length, color: '#c9873a' },
    { label: 'Finished', value: all.filter(b => b.status === 'finished').length, color: '#5a9a6e' },
    { label: 'Favorites', value: all.filter(b => b.is_favorite).length, color: '#f0c040' },
    { label: 'Physical', value: physical.length, color: '#4a7a9a' },
    { label: 'Web', value: web.length, color: '#7a6a3a' },
  ]
  const genres = {}
  all.forEach(b => { if (b.genre) genres[b.genre] = (genres[b.genre] || 0) + 1 })
  const topGenres = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxGenre = topGenres[0]?.[1] || 1

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {topGenres.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Top Genres</p>
          {topGenres.map(([genre, count]) => (
            <div key={genre} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{genre}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count}</span>
              </div>
              <div style={{ height: '3px', background: 'var(--bg-overlay)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${(count / maxGenre) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsView({ onDisconnect }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Settings</h2>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Database</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Connected to Neon PostgreSQL</p>
        <button onClick={onDisconnect} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)', color: '#f0a0a0', fontSize: '14px', cursor: 'pointer' }}>
          Disconnect & Change Database
        </button>
      </div>
    </div>
  )
}

function TabIcon({ tab }) {
  if (tab === 'physical') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
  if (tab === 'web') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
  if (tab === 'stats') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LibraryApp() {
  const [tab, setTab] = useState('physical')
  const physical = useBooks('physical')
  const web = useBooks('web')
  const allBooks = [...physical.books, ...web.books]
  const webRssCount = web.books.filter(b => b.rss_has_update).length

  const handleDisconnect = () => {
    clearNeonUrl()
    window.location.reload()
  }

  const LABELS = { physical: 'Physical', web: 'Web', stats: 'Stats', settings: 'Settings' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'max(12px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-light)', lineHeight: 1 }}>Library</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{allBooks.length} books</div>
        </div>
        <button onClick={() => { if (tab === 'physical') physical.refetch(); else if (tab === 'web') web.refetch() }}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {tab === 'physical' && <CollectionView key="physical" collection="physical" books={physical.books} loading={physical.loading} add={physical.add} update={physical.update} remove={physical.remove} allBooks={allBooks} />}
        {tab === 'web' && <CollectionView key="web" collection="web" books={web.books} loading={web.loading} add={web.add} update={web.update} remove={web.remove} allBooks={allBooks} />}
        {tab === 'stats' && <StatsView physical={physical.books} web={web.books} />}
        {tab === 'settings' && <SettingsView onDisconnect={handleDisconnect} />}
      </div>

      {/* Bottom nav */}
      <div style={{ flexShrink: 0, display: 'flex', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        {TABS.map(t => {
          const isActive = tab === t
          const badge = t === 'web' && webRssCount > 0 ? webRssCount : null
          return (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', gap: '2px', position: 'relative', color: isActive ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <TabIcon tab={t} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{LABELS[t]}</span>
              {badge && (
                <span style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(8px)', width: '16px', height: '16px', borderRadius: '50%', background: '#5a9a6e', color: '#fff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [connected, setConnected] = useState(hasNeonUrl())

  if (!connected) {
    return <Setup onComplete={() => setConnected(true)} />
  }

  return <LibraryApp />
}
