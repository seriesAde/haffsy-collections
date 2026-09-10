import { money } from '../../../lib/documents'
import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Eye, Download, Trash2 } from 'lucide-react'
import { PageHeading, SearchBox } from '../../admin/components/AdminUI'
import { primaryClass, tableClass } from '../../admin/components/styles'
import DocumentView from '../../documents/components/DocumentView'
import Modal from '../../../components/Modal'
import InvoicePreview from '../../invoices/components/InvoicePreview'
import { useDemo } from '../../admin/DemoContext'
import { cn } from '../../../lib/utils'
const colors={Pending:'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',Accepted:'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',Rejected:'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300',Expired:'bg-background text-muted'}
export default function QuotationsPage(){
 const {quotations:rows,setQuotations:setRows,invoices,setInvoices,settings}=useDemo()
 const [query,setQuery]=useState(''),[dialog,setDialog]=useState(null),[notice,setNotice]=useState('')
 const active=dialog
 function close(){setDialog(null)}
 function save(value){setRows(current=>current.map(q=>q.id===value.id?value:q));setDialog(current=>({...current,entry:value}))}
 function convert(q){if(invoices.some(i=>i.quotationId===q.id))return 'This quotation already has an invoice.';setInvoices(current=>[{...q,id:'INV-'+crypto.randomUUID().slice(0,8).toUpperCase(),quotationId:q.id,date:new Date().toISOString().slice(0,10),status:'Pending'},...current]);return 'Invoice created. Open Invoices or Orders to continue.'}
 const filtered=rows.filter(q=>(q.id+' '+q.customer).toLowerCase().includes(query.toLowerCase()))
 return <><PageHeading title="Quotations" subtitle="Manage customer quotations"><Link to="/admin/quotations/new" className={primaryClass}><Plus size={18}/>Create Quotation</Link></PageHeading>
 <div className="mb-6 flex rounded-xl border border-outline p-4"><SearchBox value={query} onChange={setQuery} placeholder="Search quotations by ID or customer..."/></div>
 {notice&&<p role="status" className="mb-4 text-sm text-muted">{notice}</p>}
 <div className="overflow-x-auto rounded-xl border border-outline"><table className={tableClass}><thead><tr>{['Quotation ID','Customer','Date','Items','Amount','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(q=><tr key={q.id}><td><button className="text-accent" onClick={()=>setDialog({mode:'view',entry:q})}>{q.id}</button></td><td>{q.customer}</td><td className="text-muted">{q.date}</td><td className="text-muted">{q.items}</td><td>{money(q.amount,q.currency)}</td><td><span className={cn('rounded-full px-3 py-1 text-xs',colors[q.status])}>{q.status}</span></td><td><div className="flex gap-1">{[[Eye,'View','text-muted'],[Download,'Download','text-blue-500'],[Trash2,'Delete','text-red-500']].map(([Icon,label,color])=><button key={label} className={cn('rounded p-2 hover:bg-background',color)} aria-label={label+' '+q.id} title={label} onClick={()=>setDialog({mode:label.toLowerCase(),entry:q})}><Icon size={16}/></button>)}</div></td></tr>)}{!filtered.length&&<tr><td colSpan={7} className="text-center text-muted">No quotations match your search.</td></tr>}</tbody></table></div>
 {active&&<Modal wide title={active.entry.id} onClose={close}>{active.mode==='delete'?<><p>Delete this quotation?</p><button className={primaryClass} onClick={()=>{setRows(current=>current.filter(q=>q.id!==active.entry.id));setNotice('Quotation deleted.');close()}}>Delete</button></>:active.mode==='download'?<InvoicePreview invoice={active.entry} business={settings} kind="quotation"/>:<DocumentView document={active.entry} kind="quotation" onSave={save} onConvert={convert}/>}</Modal>}
 </>
}
