import { useState } from 'react'
export default function ProductImageInput({ images, onChange, onBusyChange }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function choose(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (images.length + files.length > 6) { setError('Choose up to 6 images.'); return }
    if (files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError('Use JPG, PNG or WebP images up to 5 MB each.'); return }
    setBusy(true); onBusyChange?.(true); setError('')
    try {
      const added = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
          const image = new Image()
          image.onerror = reject
          image.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url: reader.result })
          image.src = reader.result
        }
        reader.readAsDataURL(file)
      })))
      onChange([...images, ...added])
    } catch { setError('One of the images could not be read. Please choose valid image files.') }
    finally { setBusy(false); onBusyChange?.(false) }
  }
  return <div className="space-y-3"><label className="grid gap-2 text-sm font-medium">Product images<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={choose} className="rounded-lg border border-dashed border-outline p-4 file:mr-4 file:rounded file:bg-accent/10 file:px-3 file:py-2 file:text-accent" /></label><p className="text-xs text-muted">Up to 6 images, 5 MB each. The first image is the product thumbnail. Images upload when you save the product.</p>
    <div className="flex flex-wrap gap-3">{images.map((image, i) => <div key={image.id} className="w-28"><img src={image.url} alt={'Preview ' + (i + 1)} className="h-24 w-full rounded-lg object-cover"/><button type="button" disabled={busy} onClick={() => onChange(images.filter(item => item.id !== image.id))} className="mt-1 text-xs text-red-500">Remove image {i + 1}</button></div>)}</div>
    {busy && <p role="status" className="text-sm text-muted">Reading images...</p>}{error && <p role="alert" className="text-sm text-red-500">{error}</p>}
  </div>
}
