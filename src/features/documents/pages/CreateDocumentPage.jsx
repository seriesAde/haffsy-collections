import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { Field, PageHeading } from '../../admin/components/AdminUI'
import { inputClass, primaryClass, secondaryClass } from '../../admin/components/styles'
import { useDemo } from '../../admin/DemoContext'
import { useInventory } from '../../inventory/InventoryContext'
import LineItems from '../components/LineItems'
import { calculateTotals, money } from '../../../lib/documents'
export default function CreateDocumentPage({kind}) {
 const invoice=kind==='invoice',title=invoice?'Invoice':'Quotation',path=invoice?'invoices':'quotations'
 const {settings,setInvoices,setQuotations}=useDemo(),{products}=useInventory(),navigate=useNavigate()
 const [error,setError]=useState('')
 const [lines,setLines]=useState([{id:'first',name:'',quantity:1,price:0}])
 const totals=calculateTotals(lines,settings.tax)
 async function save(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const setter=invoice?setInvoices:setQuotations;try {await setter(current=>[{...data,id:(invoice?'INV-':'QUO-')+crypto.randomUUID().slice(0,8).toUpperCase(),date:new Date().toISOString().slice(0,10),lines,items:lines.reduce((n,l)=>n+Number(l.quantity),0),amount:totals.total,taxRate:settings.tax,currency:settings.currency,status:'Pending'},...current]);navigate('/admin/'+path)}catch(e){setError(e.message)}}
 return <><div className="flex gap-5"><Link to={'/admin/'+path} className="mt-2" aria-label="Back to list"><ArrowLeft/></Link><PageHeading title={'Create '+title} subtitle={'Generate a new '+kind+' for customer'}/></div>
 <p role="alert">{error}</p><form onSubmit={save} className="space-y-6"><section className="rounded-xl border border-outline p-6"><h2 className="mb-5 text-lg font-semibold">Customer Information</h2><div className="grid gap-5 md:grid-cols-4"><Field label="Customer Name *"><input className={inputClass} name="customerName" required placeholder="Customer or guest name" defaultValue="" /></Field><Field label="Phone *"><input className={inputClass} name="phone" required minLength={5} maxLength={40} placeholder="Guest phone" defaultValue="" /></Field><Field label="Email"><input className={inputClass} name="email" type="email" placeholder="Guest email" defaultValue="" /></Field><Field label={invoice?'Due Date *':'Valid Until *'}><input className={inputClass} name="due" type="date" min={new Date().toISOString().slice(0,10)} required/></Field></div></section>
 <LineItems lines={lines} setLines={setLines} products={products} currency={settings.currency}/>
 <div className="ml-auto grid max-w-xs grid-cols-2 gap-3 text-right"><span className="text-muted">Subtotal:</span><span>{money(totals.subtotal,settings.currency)}</span><span className="text-muted">Tax ({settings.tax}%):</span><span>{money(totals.tax,settings.currency)}</span><strong>Total:</strong><strong className="text-accent">{money(totals.total,settings.currency)}</strong></div>
 <section className="rounded-xl border border-outline p-6"><Field label={invoice?'Payment Terms & Notes':'Additional Notes'}><textarea name="notes" className={inputClass+' mt-3'} rows={4} placeholder="Enter any additional notes or terms..."/></Field></section><div className="flex gap-4"><button className={primaryClass}><Save size={18}/>Save {title}</button><Link className={secondaryClass} to={'/admin/'+path}>Cancel</Link></div></form></>
}
