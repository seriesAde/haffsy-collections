import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
export default function Modal({title,onClose,children,wide=false}) {
 const ref=useRef(null), id=useId()
 useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close()},[])
 return <dialog ref={ref} onCancel={onClose} aria-labelledby={id} className={(wide ? 'max-w-5xl ' : 'max-w-lg ') + "m-auto max-h-[90svh] w-[calc(100%-32px)] overflow-y-auto rounded-xl border border-outline bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/50"}><div className="mb-6 flex items-center justify-between gap-4"><h2 id={id} className="text-2xl font-bold">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</dialog>
}
