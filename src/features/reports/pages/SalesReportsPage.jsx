import { Link } from 'react-router'
import { useDemo } from '../../admin/DemoContext'
import { PageHeading } from '../../admin/components/AdminUI'
import { tableClass } from '../../admin/components/styles'
import { money } from '../../../lib/documents'
export default function SalesReportsPage(){
 const {orders,settings}=useDemo()
 const rows=Object.entries(orders).map(([number,order])=>({number,...order})).filter(order=>order.paymentStatus==='Paid')
 const total=rows.filter(row=>(row.invoice?.currency||row.invoiceSnapshot?.currency)===settings.currency).reduce((sum,row)=>sum+Number(row.total||0),0)
 return <><PageHeading title="Sales Reports" subtitle="Confirmed paid orders"/><p className="mb-6 text-2xl font-bold">Paid sales: {money(total,settings.currency)}</p><div className="overflow-auto"><table className={tableClass}><thead><tr><th>Invoice</th><th>Customer</th><th>Order date</th><th>Total including delivery</th><th>Details</th></tr></thead><tbody>{rows.map(row=><tr key={row.apiId}><td><Link className="text-accent" to={'/admin/sales-reports/'+row.apiId}>{row.number}</Link></td><td>{row.invoice?.customerName||row.invoiceSnapshot?.customerName}</td><td>{row.createdAt?.slice(0,10)}</td><td>{money(row.total,row.invoice?.currency||row.invoiceSnapshot?.currency)}</td><td><Link className="text-accent" to={'/admin/sales-reports/'+row.apiId}>View sale</Link></td></tr>)}{!rows.length&&<tr><td colSpan={5}>No paid sales yet.</td></tr>}</tbody></table></div></>
}
