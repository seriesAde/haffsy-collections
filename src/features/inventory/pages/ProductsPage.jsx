import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ProductThumbnail } from '../components/ProductImages'
import { PageHeading } from '../../admin/components/AdminUI'
import { primaryClass, inputClass, tableClass } from '../../admin/components/styles'
import { useInventory } from '../InventoryContext'
import { useAuth } from '../../auth/AuthContext'

export default function ProductsPage() {
  const { adminProducts, setAvailability } = useInventory(), { user } = useAuth()
  const [params, setParams] = useSearchParams(), [busy, setBusy] = useState(''), [notice, setNotice] = useState('')
  const availability = params.get('availability') || 'available', lowOnly = params.get('stock') === 'low'
  const visible = adminProducts.filter(product => (availability === 'all' || (availability === 'unavailable' ? product.active === false : product.active !== false)) && (!lowOnly || product.stock <= product.reorder))
  async function toggle(product) {
    if (busy) return
    setBusy(product.id)
    const error = await setAvailability(product.id, product.active === false)
    setNotice(error || (product.active === false ? 'Product is available again.' : 'Product marked unavailable and removed from the storefront.'))
    setBusy('')
  }
  return <><PageHeading title={lowOnly ? 'Low Stock Products' : 'All Products'} subtitle="Manage product availability"><Link className={primaryClass} to="/admin/products/new">Add Product</Link></PageHeading>
    <label className="mb-5 grid max-w-xs gap-2">Availability<select className={inputClass} value={availability} onChange={event => setParams(current => { const next = new URLSearchParams(current); next.set('availability', event.target.value); return next })}><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="all">All statuses</option></select></label>
    <p role="status" className="mb-4">{notice}</p>{lowOnly && <Link to="/admin/products" className="text-accent">Clear low stock filter</Link>}
    <div className="overflow-auto rounded-xl border border-outline"><table className={tableClass}><thead><tr>{['Product','SKU','Category','Selling Price','Stock','Availability','Action'].map(heading=><th key={heading}>{heading}</th>)}</tr></thead><tbody>{visible.map(product=><tr key={product.id}><td><Link className="flex items-center gap-3 text-accent" to={'/admin/products/'+product.id}><ProductThumbnail product={product}/>{product.name}</Link></td><td>{product.sku}</td><td>{product.category}</td><td>{product.price.toFixed(2)}</td><td>{product.stock}</td><td>{product.active === false ? 'Unavailable' : 'Available'}</td><td>{['Admin','Manager'].includes(user.role)&&<button className={primaryClass} disabled={Boolean(busy)} onClick={()=>toggle(product)}>{busy===product.id?'Saving...':product.active===false?'Make available':'Mark unavailable'}</button>}</td></tr>)}{!visible.length&&<tr><td colSpan={7}>No products match this view.</td></tr>}</tbody></table></div></>
}
