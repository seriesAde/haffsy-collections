import { useEffect, useState } from 'react'
import Modal from '../../../components/Modal'

function ReceiptPreview({ url }) {
  const [file, setFile] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl
    async function load() {
      try {
        const response = await fetch(url, { credentials: 'include', signal: controller.signal })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || 'Could not load receipt (' + response.status + ').')
        }
        const blob = await response.blob()
        if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(blob.type)) throw new Error('The server did not return a supported receipt file.')
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setFile({ url: objectUrl, type: blob.type })
      } catch (error) { if (!controller.signal.aborted) setError(error.message) }
    }
    load()
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [url])
  if (error) return <p role="alert" className="text-red-500">{error}</p>
  if (!file) return <p role="status">Loading receipt...</p>
  return <div className="space-y-4"><a className="text-accent underline" href={file.url} download={'payment-receipt.' + (file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1])}>Download receipt</a>{file.type === 'application/pdf' ? <iframe title="Payment receipt" src={file.url} className="h-[65svh] w-full rounded-lg border border-outline"/> : <img src={file.url} alt="Submitted payment receipt" className="max-h-[65svh] w-full object-contain"/>}</div>
}
export default function ReceiptViewer({ url }) {
  const [open, setOpen] = useState(false)
  return <><button type="button" className="inline-flex rounded-lg border border-outline px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10" onClick={() => setOpen(true)}>View submitted receipt</button>{open && <Modal wide title="Payment receipt" onClose={() => setOpen(false)}><ReceiptPreview url={url}/></Modal>}</>
}
