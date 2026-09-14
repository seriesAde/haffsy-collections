import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { AuthContext, useAuth } from './AuthContext'
import { api } from '../../services/api'
export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-6">Checking your session…</p>
  if (!user) return <Navigate to="/login" replace />
  if (admin && !['Admin', 'Manager', 'Staff', 'Delivery Rider'].includes(user.role)) return <Navigate to="/profile" replace />
  return children
}
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('')
  useEffect(() => { let active = true; api('/auth/me').then(r => { if (active) setUser(r.user) }).catch(e => { if (active && e.status !== 401) setError(e.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  async function signIn(mode, body) { const r = await api('/auth/' + mode, { method: 'POST', body }); setUser(r.user); setError(''); return r.user }
  async function logout() { await api('/auth/logout', { method: 'POST' }); setUser(null) }
  async function updateProfile(body) { const r = await api('/auth/me', { method: 'PATCH', body }); setUser(r.user) }
  return <AuthContext.Provider value={{ user, loading, signIn, logout, updateProfile }}>{error && <p role="alert" className="bg-red-100 p-4 text-red-800">{error}</p>}{children}</AuthContext.Provider>
}
