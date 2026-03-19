import React, { useState } from 'react'
import { setNeonUrl, testConnection, clearNeonUrl } from '../db'

export default function Setup({ onComplete, isReconnect = false }) {
  const [url, setUrl] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!url.trim()) return
    setTesting(true); setError('')
    try {
      setNeonUrl(url.trim())
      await testConnection()
      onComplete()
    } catch (e) {
      clearNeonUrl()
      setError(e.message || 'Could not connect. Check your connection string.')
    } finally { setTesting(false) }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
        style={{ paddingTop: 'max(40px, env(safe-area-inset-top))', paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>

        <div className="text-center">
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📚</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-light)', marginBottom: '8px' }}>
            Library Tracker
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto' }}>
            {isReconnect
              ? 'Your session expired. Reconnect your Neon database to continue.'
              : 'Connect your Neon database to sync your library across devices'}
          </p>
        </div>

        <div className="w-full space-y-3" style={{ maxWidth: '380px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
            Neon Database Connection String
          </label>
          <textarea
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
            style={{
              width: '100%', background: 'var(--bg-overlay)',
              border: `1px solid ${error ? 'rgba(154,64,64,0.5)' : 'var(--border)'}`,
              color: 'var(--text-primary)', borderRadius: '12px',
              padding: '12px', fontSize: '13px', resize: 'none',
              height: '90px', outline: 'none', fontFamily: 'monospace',
              lineHeight: '1.5',
            }}
          />
          {error && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(154,64,64,0.1)', border: '1px solid rgba(154,64,64,0.3)' }}>
              <p style={{ fontSize: '12px', color: '#f0a0a0', lineHeight: '1.5' }}>{error}</p>
            </div>
          )}
          <button onClick={handleConnect} disabled={!url.trim() || testing}
            className="w-full py-4 rounded-xl"
            style={{
              background: !url.trim() || testing ? 'var(--bg-overlay)' : 'var(--accent)',
              color: !url.trim() || testing ? 'var(--text-muted)' : '#0a0908',
              fontSize: '16px', fontWeight: '700', border: 'none',
              transition: 'all 0.15s',
            }}>
            {testing ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        <div className="rounded-xl p-4 w-full" style={{ maxWidth: '380px', background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Use the same connection string from your desktop app's <code style={{ color: 'var(--accent)', fontSize: '11px' }}>.env</code> file.
            Your URL is stored only on this device.
          </p>
        </div>
      </div>
    </div>
  )
}
