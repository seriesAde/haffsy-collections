import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../services/api'
import { readWishlist, toggleWishlist } from './wishlistStorage'

export default function useWishlist(setNotice) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(() => {
    if (user) return []
    try { return readWishlist(localStorage) } catch { return [] }
  })
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')
  const pending = useRef(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await api('/wishlist')
        if (active) { setWishlist(result.data); setError('') }
      } catch (error) { if (active) setError(error.message) }
      finally { if (active) setLoading(false) }
    }
    function sync(event) {
      if (!user && (event.key === 'store-wishlist' || event.key === null)) {
        try { setWishlist(readWishlist(localStorage)) } catch { /* Retain local state. */ }
      }
    }
    if (user) load()
    window.addEventListener('storage', sync)
    return () => { active = false; window.removeEventListener('storage', sync) }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  async function toggleWish(id) {
    if (loading || pending.current || error) {
      if (error) setNotice('Wishlist could not load. Reload the page to retry.')
      return
    }
    pending.current = true
    try {
      if (user) {
        const saved = wishlist.includes(id)
        await api('/wishlist/' + id, { method: saved ? 'DELETE' : 'PUT' })
        setWishlist(rows => saved ? rows.filter(item => item !== id) : [...new Set([...rows, id])])
      } else setWishlist(toggleWishlist(localStorage, wishlist, id))
    } catch (error) { setNotice('Wishlist was not saved: ' + error.message) }
    finally { pending.current = false }
  }
  return { wishlist, toggleWish, wishlistLoading: loading, wishlistError: error }
}
