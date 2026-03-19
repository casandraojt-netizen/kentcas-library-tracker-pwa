import React, { useState } from 'react'
import { hasNeonUrl, clearNeonUrl } from './db'
import { useBooks } from './hooks/useBooks'
import CollectionView from './components/CollectionView'
import Setup from './components/Setup'

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
  return (
    <div className="scroll-area" style={{ flex: 1, padding: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const NAV = [
  { id: 'physical', label: 'Physical' },
  { id: 'web', label: 'Web' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Settings' },
]

function LibraryApp() {
  const [tab, setTab] = useState('physical')
  const physical = useBooks('physical')
  const web = useBooks('web')
  const allBooks = [...physical.books, ...web.books]
  const webRssCount = web.books.filter(b => b.rss_has_update).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'max(16px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-light)', lineHeight: 1 }}>Library</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{allBooks.length} books total</div>
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
        {tab === 'settings' && (
          <div className="scroll-area" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Settings</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Database</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Connected to Neon PostgreSQL</p>
              <button onClick={() => { clearNeonUrl(); window.location.reload() }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)', color: '#f0a0a0', fontSize: '14px', cursor: 'pointer' }}>
                Disconnect & Change Database
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ flexShrink: 0, display: 'flex', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', gap: '2px', position: 'relative', color: tab === n.id ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '10px', fontWeight: tab === n.id ? '600' : '400' }}>{n.label}</span>
            {n.id === 'web' && webRssCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', left: 'calc(50% + 14px)', width: '16px', height: '16px', borderRadius: '50%', background: '#5a9a6e', color: '#fff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {webRssCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [connected, setConnected] = useState(hasNeonUrl())
  if (!connected) return <Setup onComplete={() => setConnected(true)} />
  return <LibraryApp />
}
