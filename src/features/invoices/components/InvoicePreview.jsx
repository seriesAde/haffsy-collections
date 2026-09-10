import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'
import { createInvoicePdf, downloadInvoicePdf } from '../pdf/invoicePdf'
import { primaryClass } from '../../admin/components/styles'

export default function InvoicePreview({ invoice, business, kind = 'invoice' }) {
  const frame = useRef(null)
  useEffect(() => {
    const objectUrl = URL.createObjectURL(createInvoicePdf(invoice, business, kind).output('blob'))
    frame.current.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [invoice, business, kind])
  return <div className="space-y-4">
    <button className={primaryClass} onClick={() => downloadInvoicePdf(invoice, business, kind)}><Download size={17} />Download PDF</button>
    <p className="text-xs text-muted">Business contact details come from Settings. If your browser cannot display PDFs, use Download PDF.</p>
    <iframe ref={frame} title={'Invoice preview ' + invoice.id} className="h-[65svh] w-full rounded-lg border border-outline bg-white" />
  </div>
}
