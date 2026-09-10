import { useState } from 'react'
import { Link } from 'react-router'
import { Copy, Plus } from 'lucide-react'
import { PageHeading, Field } from '../../admin/components/AdminUI'
import { inputClass, primaryClass, secondaryClass } from '../../admin/components/styles'
import { useInventory } from '../InventoryContext'
import { generateSku } from '../sku'

export default function SkuGeneratorPage() {
  const { products, movements } = useInventory()
  const [details, setDetails] = useState({ name: '', type: '', color: '', size: '' })
  const [notice, setNotice] = useState('')
  const sku = generateSku(details, [...products, ...movements].map(item => item.sku))

  async function copy() {
    try { await navigator.clipboard.writeText(sku); setNotice('SKU copied.') }
    catch { setNotice('Copy is unavailable. Select the SKU below and copy it manually.') }
  }

  return <>
    <PageHeading title="SKU Generator" subtitle="Create a consistent identifier for each product or variant." />
    <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="space-y-6 rounded-xl border border-outline p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {[['Product name *', 'name', 'Classic Abaya'], ['Product type *', 'type', 'Abaya'], ['Color (optional)', 'color', 'Black'], ['Size (optional)', 'size', 'XL']].map(([label, key, placeholder]) => <Field key={key} label={label}>
            <input className={inputClass} value={details[key]} maxLength={100} placeholder={placeholder} onChange={event => { setDetails(current => ({ ...current, [key]: event.target.value })); setNotice('') }} />
          </Field>)}
        </div>
        <div className="rounded-xl bg-background p-5">
          <p className="mb-3 text-sm text-muted">Generated SKU</p>
          <output className="block break-all font-mono text-2xl font-semibold text-accent" aria-live="polite">{sku || 'Enter a product name and type'}</output>
          <p className="mt-3 text-xs text-muted">Type - Product - Color - Size - Sequence. Optional parts are omitted.</p>
        </div>
        {!sku && (details.name || details.type) && <p className="text-sm text-muted">Name and type must each contain at least one Latin letter or number.</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!sku} className={secondaryClass + ' disabled:cursor-not-allowed disabled:opacity-40'} onClick={copy}><Copy size={17} />Copy SKU</button>
          {sku && <Link className={primaryClass} to="/admin/products/new" state={{ productDraft: { name: details.name.trim(), category: details.type.trim(), sku, description: [details.color.trim() && 'Color: ' + details.color.trim(), details.size.trim() && 'Size: ' + details.size.trim()].filter(Boolean).join('; ') } }}><Plus size={17} />Use for new product</Link>}
        </div>
        {notice && <p role="status" className="text-sm text-muted">{notice}</p>}
      </section>
      <aside className="space-y-4 rounded-xl border border-outline p-6 text-sm leading-6">
        <h2 className="text-lg font-semibold">A simple SKU convention</h2>
        <p>For a black Classic Abaya in XL, the code is <code className="break-all text-accent">ABA-CLA-BLA-XL-001</code>.</p>
        <p className="text-muted">Use one SKU for each separately stocked variant. Keep the code stable if a product name or price changes. Use consistent names for types, colors and sizes.</p>
        <p className="text-muted">The sequence skips codes already in this demo inventory. Generating or copying a code does not reserve it; saving the product checks for duplicates again.</p>
        <p className="text-muted">A SKU is your internal reference. Supplier barcodes belong in the separate Barcode field.</p>
      </aside>
    </div>
  </>
}
