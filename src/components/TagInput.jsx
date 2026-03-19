import React, { useState, useRef, useEffect } from 'react'

const SUGGESTED_TAGS = [
  'SI','Self-Insert','OC','Gender-Bend','Reincarnation','Transmigration','Isekai',
  'Gamer','System','Progression','Power Fantasy','Slice of Life','Romance',
  'Dark','Grimdark','Comedy','Crack','Smut','Wholesome',
  'Cultivation','Xianxia','Wuxia','LitRPG','Dungeon','Magic School',
  'Post-Apocalyptic','Military','Political','Harem',
  'Crossover','Fix-It','AU','Canon Divergence','Completed','Ongoing',
  'Abandoned','Hiatus','Regular Updates','Long','Short','Epic',
]

export default function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [focused, setFocused] = useState(false)
  const inputRef = useRef()

  const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return }
    const q = input.toLowerCase()
    setSuggestions(SUGGESTED_TAGS.filter(t => t.toLowerCase().includes(q) && !tagList.includes(t)).slice(0, 5))
  }, [input, tags])

  const addTag = (tag) => {
    const cleaned = tag.trim()
    if (!cleaned || tagList.includes(cleaned)) { setInput(''); return }
    onChange([...tagList, cleaned].join(', '))
    setInput('')
    inputRef.current?.focus()
  }

  const removeTag = (tag) => onChange(tagList.filter(t => t !== tag).join(', '))

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
    else if (e.key === 'Backspace' && !input && tagList.length) removeTag(tagList[tagList.length - 1])
  }

  return (
    <div className="relative">
      <div onClick={() => inputRef.current?.focus()}
        style={{ background: 'var(--bg-overlay)', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px', padding: '8px', minHeight: '44px', display: 'flex', flexWrap: 'wrap', gap: '6px', cursor: 'text', transition: 'border-color 0.15s' }}>
        {tagList.map(tag => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(201,135,58,0.15)', border: '1px solid rgba(201,135,58,0.3)', color: 'var(--accent)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px' }}>
            {tag}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag) }} style={{ color: 'var(--accent)', lineHeight: 1, fontSize: '14px', fontWeight: '700' }}>×</button>
          </span>
        ))}
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={tagList.length === 0 ? 'Add tags...' : ''}
          style={{ flex: 1, minWidth: '80px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '2px 4px' }} />
      </div>
      {focused && suggestions.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => addTag(s)} className="w-full text-left px-4 py-2.5"
              style={{ fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {s}
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Enter or comma to add · tap × to remove</p>
    </div>
  )
}
