import { useState } from 'react'
import { Link } from 'react-router'
import { useDemo } from '../../admin/DemoContext'
import { PageHeading, SearchBox } from '../../admin/components/AdminUI'
import { inputClass, primaryClass, tableClass } from '../../admin/components/styles'
import { money } from '../../../lib/documents'

export default function OrdersPage(){
  const {invoices, orders}=useDemo()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const search = query.trim().toLowerCase()

  const rows = invoices
    .map(invoice => ({ invoice, order: orders[invoice.id] })).filter(({order})=>Boolean(order))
    .filter(({invoice}) => {
      if (!search) return true
      return `${invoice.id} ${invoice.customer}`.toLowerCase().includes(search)
    })
    .filter(({order}) => {
      if (scope === 'pending') return order?.paymentStatus !== 'Paid' && !['Collected','Received'].includes(order?.status)
      if (scope === 'paid') return order?.paymentStatus === 'Paid' && !['Collected','Received'].includes(order?.status)
      if (scope === 'collected') return ['Collected','Received'].includes(order?.status)
      return true
    })

  return <>
    <PageHeading title="Orders & Payments" subtitle="Manage fulfillment and payment for each invoice.">
      <Link className={primaryClass} to="/admin/invoices/new">Create invoice / order</Link>
    </PageHeading>

    <div className="mb-6 flex flex-wrap items-center gap-3">
      <SearchBox value={query} onChange={setQuery} placeholder="Search invoice or customer..." />
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">View</span>
        <select className={inputClass} value={scope} onChange={e => setScope(e.target.value)}>
          <option value="all">All orders</option>
          <option value="pending">Pending orders</option>
          <option value="paid">Paid but not collected / received</option>
          <option value="collected">Collected / received orders</option>
        </select>
      </label>
    </div>

    <div className="overflow-auto rounded-xl border border-outline">
      <table className={tableClass}>
        <thead>
          <tr>{['Invoice', 'Customer', 'Invoice total', 'Fulfillment', 'Payment', 'Delivery status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(({invoice, order}) => <tr key={invoice.id}>
            <td className="text-accent">{invoice.id}</td>
            <td>{invoice.customer}</td>
            <td>{money(invoice.amount, invoice.currency)}</td>
            <td>{order?.method || 'Not configured'}</td>
            <td className="text-muted">{order?.paymentStatus || 'Unpaid'}</td>
            <td className="text-muted">{order?.status || 'Not configured'}</td>
            <td><Link className="text-accent" to={'/admin/orders/' + invoice.id}>Open order</Link></td>
          </tr>)}
          {!rows.length && <tr><td colSpan={7}>No matching orders.</td></tr>}
        </tbody>
      </table>
    </div>
  </>
}
