import { ProductThumbnail } from '../components/ProductImages'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useInventory } from '../InventoryContext'
import { Field, PageHeading } from '../../admin/components/AdminUI'
import { inputClass, primaryClass, secondaryClass } from '../../admin/components/styles'
import Modal from '../../../components/Modal'

export default function CategoriesPage() {
  const { category } = useParams()
  const { products, categories, saveCategory, deleteCategory } = useInventory()
  const navigate = useNavigate()
  const [dialog, setDialog] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const rows = products.filter(p => p.category === category)
  const exists = categories.includes(category)

  function open(mode, name = '') { setError(''); setDialog({ mode, name }) }
  async function submit(event) {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('name')).trim()
    const failure = await saveCategory(name, dialog.mode === 'edit' ? dialog.name : undefined)
    if (failure) { setError(failure); return }
    if (category === dialog.name) navigate('/admin/categories/' + encodeURIComponent(name))
    setNotice('Category saved.'); setDialog(null)
  }
  async function remove() {
    const failure = await deleteCategory(dialog.name)
    if (failure) { setError(failure); return }
    if (category === dialog.name) navigate('/admin/categories')
    setNotice('Category deleted.'); setDialog(null)
  }
  function actions(name) { return <div className="mt-4 flex gap-2"><button className={secondaryClass} onClick={() => open('edit', name)}>Edit</button><button className={secondaryClass + ' text-red-500'} onClick={() => open('delete', name)}>Delete</button></div> }
  return <>
    <PageHeading title={category || 'Categories'} subtitle="Manage your product categories."><button className={primaryClass} onClick={() => open('create')}>Add category</button></PageHeading>
    {notice && <p role="status" className="mb-4 text-sm text-muted">{notice}</p>}
    {category && <div className="mb-5"><Link className="text-accent" to="/admin/categories">All categories</Link>{exists && actions(category)}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {category ? rows.map(p => <Link key={p.id} to={'/admin/products/' + p.id} className="rounded-xl border border-outline p-6 hover:border-accent"><ProductThumbnail product={p}/><h2 className="mt-3 font-semibold">{p.name}</h2><p className="mt-2 text-sm text-muted">{p.sku} / {p.stock} in stock</p></Link>) : [...categories].sort().map(name => <article key={name} className="rounded-xl border border-outline p-6"><Link className="font-semibold text-accent" to={'/admin/categories/' + encodeURIComponent(name)}>{name}</Link><p className="mt-2 text-sm text-muted">{products.filter(p => p.category === name).length} products</p>{actions(name)}</article>)}
    </div>
    {category && !rows.length && <p>{exists ? 'No products in this category yet.' : 'Category not found.'}</p>}
    {!category && !categories.length && <p>No categories yet. Create your first category.</p>}
    {dialog && <Modal title={dialog.mode === 'delete' ? 'Delete category?' : dialog.mode === 'edit' ? 'Edit category' : 'Add category'} onClose={() => setDialog(null)}>
      {dialog.mode === 'delete' ? <div className="space-y-4"><p>Delete {dialog.name}? Categories containing products must be emptied first.</p>{error && <p role="alert" className="text-red-500">{error}</p>}<button className={primaryClass} onClick={remove}>Delete category</button><button className={secondaryClass + ' ml-3'} onClick={() => setDialog(null)}>Cancel</button></div> : <form onSubmit={submit} className="space-y-4"><Field label="Category name"><input className={inputClass} name="name" required maxLength={100} defaultValue={dialog.name} /></Field>{error && <p role="alert" className="text-red-500">{error}</p>}<button className={primaryClass}>Save category</button><button type="button" className={secondaryClass + ' ml-3'} onClick={() => setDialog(null)}>Cancel</button></form>}
    </Modal>}
  </>
}
