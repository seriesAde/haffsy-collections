// Replace this adapter with GET /categories when the backend is available.
// Contract: Promise<Array<{ id: string, name: string }>>. Throw on request failure.
export async function listCategories({ demoCategories, signal }) {
  signal?.throwIfAborted()
  return demoCategories.map(name => ({ id: name, name }))
}
