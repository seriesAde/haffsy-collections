import InvoicePreview from '../components/InvoicePreview'
import DocumentView from '../../documents/components/DocumentView'
import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Eye, Send, Download, Trash2 } from 'lucide-react'
import { useDemo } from '../../admin/DemoContext'
import { PageHeading, SearchBox } from '../../admin/components/AdminUI'
import { primaryClass, tableClass } from '../../admin/components/styles'
import Modal from '../../../components/Modal'
import StatusBadge from '../../../components/StatusBadge'
import { money } from '../../../lib/documents'
export default function InvoicesPage(){
 const {invoices,setInvoices,settings}=useDemo(),[query,setQuery]=useState(''),[dialog,setDialog]=useState(null)
 const rows=invoices.filter(i=>(i.id+' '+i.customer).toLowerCase().includes(query.toLowerCase()))
 return <><PageHeading title="Invoices" subtitle="Manage customer invoices and payments"><Link className={primaryClass} to="/admin/invoices/new"><Plus size={17}/>Create Invoice</Link></PageHeading><div className="mb-6 flex rounded-xl border border-outline p-4"><SearchBox value={query} onChange={setQuery} placeholder="Search invoices by ID or customer..."/></div><div className="overflow-auto rounded-xl border border-outline"><table className={tableClass}><thead><tr>{['Invoice ID','Customer','Issue Date','Due Date','Amount','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(i=><tr key={i.id}><td className="text-accent">{i.id}</td><td>{i.customer}</td><td className="text-muted">{i.date}</td><td className="text-muted">{i.due}</td><td>{money(i.amount,i.currency)}</td><td><StatusBadge status={i.status}/></td><td><div className="flex">{[[Eye,'View'],[Send,'Send'],[Download,'Download'],[Trash2,'Delete']].map(([Icon,action])=><button key={action} title={action} aria-label={action+' '+i.id} className={'rounded p-2 hover:bg-background '+(action==='Delete'?'text-red-500':'text-accent')} onClick={()=>setDialog({action,entry:i})}><Icon size={16}/></button>)}</div></td></tr>)}{!rows.length&&<tr><td colSpan={7} className="text-center text-muted">No invoices match your search.</td></tr>}</tbody></table></div>
 {dialog&&<Modal wide={['View','Download'].includes(dialog.action)} title={dialog.action+' '+dialog.entry.id} onClose={()=>setDialog(null)}>{dialog.action==='Delete'?<><p>Delete this invoice from the demo workspace?</p><button className={primaryClass+' mt-5'} onClick={()=>{setInvoices(current=>current.filter(i=>i.id!==dialog.entry.id));setDialog(null)}}>Delete invoice</button></>:dialog.action==='Send'?<p className="text-muted">Email delivery is not connected. No invoice has been sent. You can download a copy from the invoice list.</p>:dialog.action==='Download'?<InvoicePreview invoice={dialog.entry} business={settings}/>:<DocumentView document={dialog.entry} onSave={updated=>{setInvoices(current=>current.map(invoice=>invoice.id===updated.id?updated:invoice));setDialog(current=>({...current,entry:updated}))}}/>}</Modal>}</>
}
