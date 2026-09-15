import test from 'node:test'
import assert from 'node:assert/strict'
import { readWishlist, toggleWishlist } from './wishlistStorage.js'

test('wishlist survives reload immediately after toggling and persists removals', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) }
  toggleWishlist(storage, [], 'product-1')
  assert.deepEqual(readWishlist(storage), ['product-1'])
  toggleWishlist(storage, readWishlist(storage), 'product-2')
  assert.deepEqual(readWishlist(storage), ['product-1','product-2'])
  toggleWishlist(storage, readWishlist(storage), 'product-1')
  assert.deepEqual(readWishlist(storage), ['product-2'])
})

test('unreadable saved data is not overwritten and blocked writes report failure', () => {
  let writes = 0
  const storage = { getItem: () => '{broken', setItem: () => { writes++; throw new Error('Storage blocked') } }
  assert.throws(() => readWishlist(storage))
  assert.equal(writes, 0)
  assert.throws(() => toggleWishlist(storage, ['saved'], 'new'), /Storage blocked/)
})
