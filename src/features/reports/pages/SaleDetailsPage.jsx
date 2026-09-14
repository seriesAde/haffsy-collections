import { useEffect,useState } from 'react'
import { Link,useParams } from 'react-router'
import { api,fileUrl } from '../../../services/api'
import { money } from '../../../lib/documents'
import DocumentView from '../../documents/components/DocumentView'
import { useDemo } from '../../admin/DemoContext'
import Modal from '../../../components/Modal'
import SaleReportPreview from '../SaleReportPreview'
export default function SaleDetailsPage(){
 const {settings}=useDemo()
 const [preview,setPreview]=useState(false)
 const {id}=useParams(),[result,setResult]=useState(null),[error,setError]=useState('')
 useEffect(()=>{const controller=new AbortController();api('/orders/'+id,{signal:controller.signal}).then(r=>{if(!controller.signal.aborted)setResult({id,data:r.data})}).catch(e=>{if(!controller.signal.aborted)setError(e.message)});return()=>controller.abort()},[id])
 if(error)return <p role="alert">{error} <Link to="/admin/sales-reports">Back to sales</Link></p>
 if(result?.id!==id)return <p>Loading sale...</p>
 const {order,invoice,payments,paid,total,balance,paymentStatus}=result.data
 const source=invoice||order.invoiceSnapshot
 if(!source)return <p>Invoice details are unavailable.</p>
 const document={...source,id:source.number,customer:source.customerName,date:source.createdAt?.slice(0,10)||order.createdAt?.slice(0,10),due:source.due?.slice(0,10),lines:(source.lines||[]).map((l,index)=>({...l,id:String(index)}))}
 return <div className="space-y-6"><Link className="text-accent" to="/admin/sales-reports">Back to sales reports</Link><h1 className="text-3xl font-bold">Sale {source.number}</h1><section className="grid gap-4 rounded-xl border border-outline p-6 sm:grid-cols-2"><p>Payment status: {paymentStatus}</p><p>Fulfillment: {order.method} - {order.stage}</p><p>Order total: {money(total,source.currency)}</p><p>Verified received: {money(paid,source.currency)}</p><p>Delivery fee: {money(order.deliveryFee,source.currency)}</p><p>Balance: {money(balance,source.currency)}</p><p>Contact: {order.contact?.phone||order.guestContact?.phone||'Not supplied'}</p><p>Location: {order.location||'Pickup'}</p></section><DocumentView document={document} onDownload={()=>setPreview(true)} downloadLabel="Download sale report PDF"/>{preview&&<Modal wide title="Sale report PDF preview" onClose={()=>setPreview(false)}><SaleReportPreview sale={result.data} business={settings}/></Modal>}<section className="space-y-3"><h2 className="text-xl font-bold">Payments and receipts</h2>{payments.map(payment=><article key={payment.id} className="rounded-xl border border-outline p-4"><p>{payment.method}: {money(payment.amount,source.currency)} - {payment.status}</p><p>{new Date(payment.createdAt).toLocaleString()}</p>{payment.evidence&&<a className="text-accent" href={fileUrl(payment.evidence)} target="_blank" rel="noreferrer">View proof of payment</a>}</article>)}</section><section><h2 className="text-xl font-bold">Order timeline</h2>{order.timeline.map((event,index)=><p key={index}>{event.stage} - {new Date(event.at).toLocaleString()}</p>)}</section><Link className="text-accent" to={'/admin/orders/'+source.number}>Open order</Link></div>
}
