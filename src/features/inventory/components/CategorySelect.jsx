import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useInventory } from '../InventoryContext'
import { listCategories } from '../services/categoryService'
import { inputClass } from '../../admin/components/styles'
export default function CategorySelect({ initialValue = '' }) {
  const { categories } = useInventory()
  const [result, setResult] = useState({ options: [], error: '', ready: false })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    listCategories({ signal: controller.signal }).then(options => {
      if (!controller.signal.aborted) setResult({ options, error: '', ready: true })
    }).catch(() => { if (!controller.signal.aborted) setResult({ options: [], error: 'Could not load categories.', ready: true }) })
    return () => controller.abort()
  }, [categories, retry])
  return <>
    <select key={result.options.map(c => c.id).join('|')} className={inputClass} name="category" required disabled={!result.ready || Boolean(result.error)} defaultValue={result.options.some(c => c.name === initialValue) ? initialValue : ''}>
      <option value="">{!result.ready ? 'Loading categories...' : result.options.length ? 'Select category' : 'No categories available'}</option>
      {result.options.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
    </select>
    {result.error && <span role="alert" className="text-sm text-red-500">{result.error} <button type="button" onClick={() => setRetry(n => n + 1)}>Retry</button></span>}
    <Link to="/admin/categories" className="text-xs text-accent">Manage categories</Link>
  </>
}
