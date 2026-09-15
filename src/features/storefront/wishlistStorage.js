const key = 'store-wishlist'

export function readWishlist(storage) {
  const saved = JSON.parse(storage.getItem(key) || '[]')
  return Array.isArray(saved) ? [...new Set(saved.filter(id => typeof id === 'string'))] : []
}

export function toggleWishlist(storage, current, id) {
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  storage.setItem(key, JSON.stringify(next))
  return next
}
