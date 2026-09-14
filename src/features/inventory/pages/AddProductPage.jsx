import ProductImageInput from '../components/ProductImageInput'
import CategorySelect from '../components/CategorySelect'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { Field, PageHeading } from '../../admin/components/AdminUI'
import { inputClass, primaryClass, secondaryClass } from '../../admin/components/styles'
import { useInventory } from '../InventoryContext'
export default function AddProductPage(){
 const [images,setImages]=useState([]),[imagesBusy,setImagesBusy]=useState(false)
 const draft=useLocation().state?.productDraft || {};
 const {addProduct}=useInventory(); const navigate=useNavigate(); const [error,setError]=useState('')
 async function submit(e){e.preventDefault(); const data=Object.fromEntries(new FormData(e.currentTarget)); for(const key of ['name','sku','category']) if(!String(data[key]||'').trim()){setError('Please fill in all required fields.');return}
 const product={...data,images,name:data.name.trim(),sku:data.sku.trim(),stock:Number(data.stock),price:Number(data.price),cost:Number(data.cost),reorder:Number(data.reorder)}
 const failure= await addProduct(product); if(failure){setError(failure);return} navigate('/admin/products',{state:{saved:true}})
 }
 return <><div className="flex items-start gap-5"><Link to="/admin/products" aria-label="Back to products" className="mt-2"><ArrowLeft/></Link><PageHeading title="Add New Product" subtitle="Add a new product to your inventory"/></div>
 <form onSubmit={submit} className="grid gap-6 rounded-xl border border-outline p-5 lg:p-6">
 <Field label="Product Name *"><input className={inputClass} name="name" defaultValue={draft.name || ''} placeholder="Enter product name" required/></Field>
 <div className="grid gap-6 md:grid-cols-2"><Field label="SKU *"><input className={inputClass} name="sku" defaultValue={draft.sku || ''} placeholder="e.g., LSP-001" required/></Field><Field label="Category *"><CategorySelect initialValue={draft.category || ''} /></Field></div>
 <ProductImageInput images={images} onChange={setImages} onBusyChange={setImagesBusy}/><Field label="Description"><textarea className={inputClass} name="description" defaultValue={draft.description || ''} rows={4} placeholder="Enter product description"/></Field>
 <div className="grid gap-6 md:grid-cols-2">{[['Selling Price *','price','0.00',true],['Cost Price','cost','0.00',false],['Initial Stock *','stock','0',true],['Reorder Level','reorder','0',false]].map(([label,name,placeholder,required])=><Field key={name} label={label}><input className={inputClass} name={name} type="number" min="0" max="999999999" step={name==='price'||name==='cost'?'0.01':'1'} placeholder={placeholder} required={required}/></Field>)}<Field label="Supplier"><input className={inputClass} name="supplier" placeholder="Enter supplier name"/></Field><Field label="Barcode"><input className={inputClass} name="barcode" placeholder="Enter barcode"/></Field></div>
 {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
 <div className="flex gap-4 border-t border-outline pt-4"><button disabled={imagesBusy} className={primaryClass}><Save size={18}/>Save Product</button><Link className={secondaryClass} to="/admin/products">Cancel</Link></div>
 </form></>
}
