import { Link } from 'react-router'
import { useDemo } from '../../admin/DemoContext'
import { money } from '../../../lib/documents'

export default function StoreOrdersPage() {
  const { orders, invoices } = useDemo()
  return <section className="space-y-5"><h1 className="text-3xl font-bold">Your orders</h1>
    {!Object.keys(orders).length && <p>No orders yet. <Link className="text-accent" to="/shop">Browse products</Link></p>}
    {invoices.filter(invoice => orders[invoice.id]).map(invoice => {
      const order = orders[invoice.id]
      return <Link key={invoice.id} to={'/orders/' + invoice.id} className="flex flex-wrap justify-between gap-4 rounded-xl border border-outline bg-surface p-5 hover:border-accent">
        <div><h2 className="font-semibold">{invoice.id}</h2><p className="mt-1 text-sm text-muted">{invoice.date} ? {order.method}</p></div>
        <div className="text-right"><p>{money(order.total ?? invoice.amount, invoice.currency)}</p><p className="text-sm text-muted">{order.status} ? {order.paymentStatus}</p><span className="text-sm text-accent">View order</span></div>
      </Link>
    })}
  </section>
}
