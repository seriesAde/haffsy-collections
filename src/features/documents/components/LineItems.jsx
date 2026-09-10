import { Plus, Trash2 } from 'lucide-react'
import { Field } from '../../admin/components/AdminUI'
import { inputClass, primaryClass } from '../../admin/components/styles'
import { money } from '../../../lib/documents'
export default function LineItems({lines,setLines,products,currency}) {
 function update(id,key,value){setLines(current=>current.map(l=>l.id===id?{...l,[key]:value}:l))}
 return <section className="rounded-xl border border-outline p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Items</h2><button type="button" className={primaryClass} onClick={()=>setLines([...lines,{id:crypto.randomUUID(),name:'',quantity:1,price:0}])}><Plus size={16}/>Add Item</button></div>
 <datalist id="document-products">{products.map(p=><option key={p.id} value={p.name}/>)}</datalist>
 <div className="space-y-4">{lines.map((line,i)=><div key={line.id} className="grid items-end gap-4 md:grid-cols-[1fr_90px_120px_120px_32px]">
 <Field label={'Product '+(i+1)}><input className={inputClass} list="document-products" value={line.name} required pattern=".*\S.*" onChange={e=>{const product=products.find(p=>p.name===e.target.value);setLines(current=>current.map(l=>l.id===line.id?{...l,name:e.target.value,...(product?{price:product.price}:{})}:l))}}/></Field>
 <Field label="Quantity"><input className={inputClass} type="number" min="1" max="1000000" step="1" required value={line.quantity} onChange={e=>update(line.id,'quantity',e.target.value)}/></Field>
 <Field label="Price"><input className={inputClass} type="number" min="0" max="100000000" step="0.01" required value={line.price} onChange={e=>update(line.id,'price',e.target.value)}/></Field>
 <output className="rounded-lg bg-background p-3 text-sm">{money(Number(line.quantity)*Number(line.price),currency)}</output>
 <button type="button" disabled={lines.length===1} className="p-2 text-red-500 disabled:opacity-30" aria-label={'Remove item '+(i+1)} onClick={()=>setLines(lines.filter(l=>l.id!==line.id))}><Trash2 size={17}/></button>
 </div>)}</div></section>
}
