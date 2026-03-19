/**
 * Database layer for PWA
 * Uses Neon's serverless driver via a Vercel API route to avoid CORS issues
 */

const STORAGE_KEY = 'neon_connection_string'

export function setNeonUrl(url) {
  localStorage.setItem(STORAGE_KEY, url.trim())
}

export function getNeonUrl() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function clearNeonUrl() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasNeonUrl() {
  return !!getNeonUrl()
}

// Send query through our own Vercel API route which has the pg driver server-side
async function runQuery(sql, params = []) {
  const url = getNeonUrl()
  if (!url) throw new Error('No database URL configured')

  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectionString: url, sql, params }),
  })

  if (!response.ok) {
    const text = await response.text()
    let msg = text
    try { msg = JSON.parse(text).error || text } catch (_) {}
    throw new Error(msg)
  }

  const data = await response.json()
  return data.rows || []
}

export async function testConnection() {
  const rows = await runQuery('SELECT 1 as ok')
  return rows[0]?.ok === 1 || rows[0]?.ok === '1'
}

export async function getBooks(collection) {
  const sql = collection
    ? `SELECT * FROM books WHERE collection = $1 AND deleted = false ORDER BY
       CASE WHEN rss_has_update = true THEN 0 ELSE 1 END,
       CASE WHEN rss_last_item_date IS NOT NULL THEN rss_last_item_date ELSE '1970-01-01'::timestamptz END DESC`
    : `SELECT * FROM books WHERE deleted = false ORDER BY
       CASE WHEN rss_has_update = true THEN 0 ELSE 1 END,
       CASE WHEN rss_last_item_date IS NOT NULL THEN rss_last_item_date ELSE '1970-01-01'::timestamptz END DESC`
  const rows = await runQuery(sql, collection ? [collection] : [])
  return rows.map(deserialize)
}

export async function upsertBook(book) {
  const now = new Date().toISOString()
  await runQuery(`
    INSERT INTO books (
      id, collection, title, author, cover_url, genre, status, status_changed_at,
      current_chapter, total_chapters, year, is_favorite, notes, tags, is_r18,
      source_url, web_type, rss_feed_url, rss_last_item_title, rss_last_item_date,
      rss_has_update, rss_last_checked, created_at, updated_at, deleted
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
    )
    ON CONFLICT(id) DO UPDATE SET
      title=EXCLUDED.title, author=EXCLUDED.author, cover_url=EXCLUDED.cover_url,
      genre=EXCLUDED.genre, status=EXCLUDED.status, status_changed_at=EXCLUDED.status_changed_at,
      current_chapter=EXCLUDED.current_chapter, total_chapters=EXCLUDED.total_chapters,
      year=EXCLUDED.year, is_favorite=EXCLUDED.is_favorite, notes=EXCLUDED.notes,
      tags=EXCLUDED.tags, is_r18=EXCLUDED.is_r18, source_url=EXCLUDED.source_url,
      web_type=EXCLUDED.web_type, rss_feed_url=EXCLUDED.rss_feed_url,
      rss_last_item_title=EXCLUDED.rss_last_item_title,
      rss_last_item_date=EXCLUDED.rss_last_item_date,
      rss_has_update=EXCLUDED.rss_has_update, rss_last_checked=EXCLUDED.rss_last_checked,
      updated_at=EXCLUDED.updated_at, deleted=EXCLUDED.deleted
    WHERE EXCLUDED.updated_at > books.updated_at
  `, [
    book.id, book.collection, book.title || '', book.author || '',
    book.cover_url || '', book.genre || '', book.status || 'unread',
    book.status_changed_at || now, book.current_chapter || '',
    book.total_chapters || '', book.year || null,
    book.is_favorite || false, book.notes || '', book.tags || '',
    book.is_r18 || false, book.source_url || '', book.web_type || 'novel',
    book.rss_feed_url || '', book.rss_last_item_title || '',
    book.rss_last_item_date || null, book.rss_has_update || false,
    book.rss_last_checked || null, book.created_at || now,
    book.updated_at || now, book.deleted || false,
  ])
}

export async function updateBook(id, updates) {
  const now = new Date().toISOString()
  const allowed = ['title','author','cover_url','genre','status','status_changed_at',
    'current_chapter','total_chapters','year','is_favorite','notes','tags','is_r18',
    'source_url','web_type','rss_feed_url','rss_has_update','deleted']
  const fields = Object.keys(updates).filter(k => allowed.includes(k))
  if (!fields.length) return
  fields.push('updated_at')
  updates.updated_at = now
  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  await runQuery(
    `UPDATE books SET ${setClauses} WHERE id = $1`,
    [id, ...fields.map(f => updates[f])]
  )
}

export async function deleteBook(id) {
  await runQuery(
    `UPDATE books SET deleted = true, updated_at = $2 WHERE id = $1`,
    [id, new Date().toISOString()]
  )
}

export async function clearRssUpdate(id) {
  await runQuery(
    `UPDATE books SET rss_has_update = false, updated_at = $2 WHERE id = $1`,
    [id, new Date().toISOString()]
  )
}

function deserialize(row) {
  return {
    ...row,
    is_favorite: !!row.is_favorite,
    is_r18: !!row.is_r18,
    rss_has_update: !!row.rss_has_update,
    deleted: !!row.deleted,
    year: row.year ? parseInt(row.year) : null,
  }
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
