import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useStore } from '../StoreContext'
import { useInventory } from '../../inventory/InventoryContext'
import { useDemo } from '../../admin/DemoContext'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../../services/api'
import { money } from '../../../lib/documents'
import { inputClass, primaryClass } from '../../admin/components/styles'

export default function CheckoutPage() {
  const store = useStore(), { refresh, settings } = useDemo(), inventory = useInventory(), { user, loading } = useAuth()
  const [method, setMethod] = useState('Delivery'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [receipt, setReceipt] = useState(null)
  const submitting = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !user) return
    const values = Object.fromEntries(new FormData(event.currentTarget))
    submitting.current = true; setBusy(true); setError('')
    try {
      const result = await api('/checkout', { method: 'POST', body: {
        items: store.items.map(item => ({ product: item.id, quantity: item.quantity })),
        method, location: method === 'Delivery' ? values.address : '',
        contact: { name: values.name, phone: values.phone, ...(values.email.trim() ? { email: values.email.trim() } : {}) }
      } })
      setReceipt(result.receipt)
      store.clear()
      // A refresh failure must not turn a successfully placed order into a retry.
      Promise.all([refresh(), inventory.refresh()]).catch(() => {})
    } catch (error) { setError(error.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  if (loading) return <p>Checking your account...</p>
  if (!user) return <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-outline bg-surface p-6"><h1 className="text-2xl font-bold">Create an account to checkout</h1><p className="text-muted">Save your details and follow your orders. Your cart will be waiting when you return.</p><div className="flex flex-wrap items-center gap-4"><Link className={primaryClass} to="/signup?next=checkout">Create account</Link><Link className="text-accent" to="/login?next=checkout">Already have an account? Sign in</Link></div></section>
  if (receipt) return <section className="mx-auto max-w-2xl space-y-5 rounded-xl border border-outline p-6"><h1 className="text-3xl font-bold">Order placed</h1><p>Your reference: <strong>{receipt.number}</strong></p><p>Items and tax: {money(receipt.amount, receipt.currency)}</p><p>{receipt.method === 'Delivery' ? 'Our team will contact you to confirm delivery fees and payment arrangements.' : 'Our team will contact you about pickup and payment.'}</p><p>Save your order reference for enquiries. No payment has been collected.</p><Link className={primaryClass} to="/shop">Continue shopping</Link>{user&&<Link className="ml-4 text-accent" to="/profile">Your account</Link>}</section>
  if (!store.items.length) return <p>Your cart is empty. <Link to="/shop">Go shopping</Link></p>
  return <section className="mx-auto max-w-2xl"><h1 className="mb-6 text-3xl font-bold">Checkout</h1><form onSubmit={submit} className="space-y-5">{[['name','Full name'],['phone','Phone number'],['email','Email (optional)'],['address','Delivery address']].map(([name,label])=><label key={name} className="grid gap-2">{label}<input name={name} type={name==='email'?'email':name==='phone'?'tel':'text'} className={inputClass} defaultValue={user?.[name]||''} required={['name','phone'].includes(name)||(name==='address'&&method==='Delivery')} maxLength={name==='address'?1000:name==='email'?254:name==='phone'?40:100}/></label>)}<label className="grid gap-2">Fulfillment<select className={inputClass} value={method} onChange={event=>setMethod(event.target.value)}><option>Delivery</option><option>Pickup</option></select></label>{method==='Pickup'&&<p>Pickup: {settings.address}, {settings.city}</p>}<p>Prices and stock are checked when you submit. Delivery fees are confirmed by our team. Cash and transfer payments are arranged after ordering.</p>{error&&<p role="alert">{error}</p>}<button disabled={busy} className={primaryClass}>{busy?'Submitting...':'Place order'}</button></form></section>
}
