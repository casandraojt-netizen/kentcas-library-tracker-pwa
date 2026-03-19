import { useState, useEffect, useCallback } from 'react'
import { getBooks, updateBook, upsertBook, deleteBook, uuid, getNeonUrl } from '../db'

export function useBooks(collection) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!getNeonUrl()) { setLoading(false); return }
    try {
      setLoading(true)
      setBooks(await getBooks(collection))
      setError(null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [collection])

  useEffect(() => { fetch() }, [fetch])

  const add = useCallback(async (book) => {
    const now = new Date().toISOString()
    const newBook = { ...book, id: uuid(), collection, created_at: now, updated_at: now }
    await upsertBook(newBook)
    await fetch()
    return newBook
  }, [collection, fetch])

  const update = useCallback(async (id, updates) => {
    const now = new Date().toISOString()
    const statusChanged = updates.status && books.find(b => b.id === id)?.status !== updates.status
    await updateBook(id, {
      ...updates,
      updated_at: now,
      ...(statusChanged ? { status_changed_at: now } : {}),
    })
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates, updated_at: now } : b))
  }, [books])

  const remove = useCallback(async (id) => {
    await deleteBook(id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  return { books, loading, error, refetch: fetch, add, update, remove }
}
