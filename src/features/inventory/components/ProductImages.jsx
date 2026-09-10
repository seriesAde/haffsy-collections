import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import Modal from '../../../components/Modal'
export function ProductThumbnail({ product }) {
  const first = product.images?.[0]
  return first ? <img src={first.url} alt={product.name} className="size-14 shrink-0 rounded-lg border border-outline object-cover" /> : <span aria-label="No product image" className="grid size-14 shrink-0 place-items-center rounded-lg bg-background text-muted"><ImageIcon size={22}/></span>
}
export function ProductGallery({ product }) {
  const [active, setActive] = useState(null)
  return <section className="mb-6 rounded-xl border border-outline p-6"><h2 className="mb-4 text-lg font-semibold">Product images</h2>
    {product.images?.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{product.images.map((image, i) => <button key={image.id} type="button" onClick={() => setActive(image)} aria-label={'View image ' + (i + 1)}><img src={image.url} alt={product.name + ' - image ' + (i + 1)} className="h-48 w-full rounded-lg bg-background object-contain" /></button>)}</div> : <p className="text-sm text-muted">No images added.</p>}
    {active && <Modal wide title={product.name} onClose={() => setActive(null)}><img src={active.url} alt={product.name} className="max-h-[75svh] w-full object-contain" /></Modal>}
  </section>
}
