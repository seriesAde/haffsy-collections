export const apiBase = import.meta.env?.VITE_API_URL || 'https://haffsy-collections.onrender.com/api'
export async function api(path, options = {}) {
  let response
  try {
    response = await fetch(apiBase + path, { credentials: 'include', ...options,
      headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
      body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body) })
  } catch { throw new Error('Cannot reach the backend. Start the backend server and try again.') }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed. Please try again.')
    error.status = response.status
    if (data?.details?.length) error.message += ': ' + data.details.map(d => `${d.field}: ${d.message}`).join('; ')
    throw error
  }
  return data
}
export async function list(path) {
  const rows = []
  for (let page = 1; ; page++) {
    const result = await api(`${path}${path.includes('?')?'&':'?'}limit=100&page=${page}`)
    rows.push(...result.data)
    if (result.data.length < 100 || (result.total !== undefined && rows.length >= result.total)) return rows
  }
}
export const fileUrl = id => `${apiBase}/uploads/${id}`
export async function upload(file, purpose) {
  const body = new FormData(); body.append('file', file)
  const { data } = await api(`/uploads/${purpose}`, { method: 'POST', body })
  return { ...data, url: fileUrl(data.id) }
}
