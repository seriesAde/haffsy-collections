import { useEffect, useId, useState } from 'react'
import { FileCheck, Upload } from 'lucide-react'

export default function PaymentProofInput({ disabled }) {
  const id = useId(), [file, setFile] = useState(null), [preview, setPreview] = useState('')
  useEffect(() => {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url) // eslint-disable-line react-hooks/set-state-in-effect
    return () => URL.revokeObjectURL(url)
  }, [file])
  return <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-5 focus-within:ring-2 focus-within:ring-accent">
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 font-semibold"><span className="rounded-lg bg-accent/10 p-3 text-accent">{file ? <FileCheck size={22}/> : <Upload size={22}/>}</span><span>Proof of payment <span className="text-red-500">*</span><span className="mt-1 block text-sm font-normal text-muted">Choose a receipt image or PDF to attach.</span></span></label>
    <input id={id} name="evidence" type="file" required disabled={disabled} accept="image/jpeg,image/png,image/webp,application/pdf" aria-describedby={id+'-help'} onChange={event=>{setPreview('');setFile(event.target.files?.[0]||null)}} className="mt-4 block w-full min-w-0 text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2.5 file:font-semibold file:text-white disabled:opacity-50"/>
    <p id={id+'-help'} className="mt-3 text-xs text-muted">JPG, PNG, WebP or PDF. Maximum 10 MB. Required for cash and transfer payments.</p>
    {file&&<p role="status" className="mt-3 break-all text-sm font-medium">Selected: {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</p>}
    {preview&&<img src={preview} alt="Selected payment receipt preview" className="mt-4 max-h-48 w-full rounded-lg border border-outline bg-surface object-contain"/>}
  </div>
}
