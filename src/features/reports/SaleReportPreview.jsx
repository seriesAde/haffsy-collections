import { useEffect, useRef } from 'react'
import { createSalePdf } from './salePdf'
import { fileUrl } from '../../services/api'
import { primaryClass } from '../admin/components/styles'

export default function SaleReportPreview({ sale, business }) {
  const frame = useRef(null)
  const receiptUrl = id => new URL(fileUrl(id), window.location.origin).href
  useEffect(() => {
    const url = URL.createObjectURL(createSalePdf(sale, business, id => new URL(fileUrl(id), window.location.origin).href).output('blob'))
    frame.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [sale, business])
  return <div className="space-y-4"><button className={primaryClass} onClick={() => createSalePdf(sale, business, receiptUrl).save(`Sale-${(sale.invoice || sale.order.invoiceSnapshot).number}.pdf`)}>Download full sale report</button><p className="text-sm text-muted">Includes sale details, payments, fulfillment and timeline. Receipt links require an authorized sign-in; receipt files are not embedded.</p><iframe ref={frame} title="Full sale report preview" className="h-[65svh] w-full rounded-xl border border-outline bg-white" /></div>
}
