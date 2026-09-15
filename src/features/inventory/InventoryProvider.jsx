import { useCallback, useEffect, useState } from 'react'
import { InventoryContext } from './InventoryContext'
import { useAuth } from '../auth/AuthContext'
import { api, list, fileUrl, upload } from '../../services/api'
export default function InventoryProvider({ children }) {
 const {user}=useAuth();const [products,setProducts]=useState([]),[unavailable,setUnavailable]=useState([]),[categoryRows,setCategoryRows]=useState([]),[movements,setMovements]=useState([]),[error,setError]=useState('')
 const [loading,setLoading]=useState(true)
 const refresh=useCallback(async()=>{const [p,c]=await Promise.all([list('/products'),api('/categories')]);setCategoryRows(c.data);setProducts(p.map(p=>({...p,categoryId:p.category?.id||p.category,category:p.category?.name||'',images:(p.images||[]).map(i=>({id:i.id||i,name:i.name||'Product image',url:fileUrl(i.id||i)}))})));if(user&&['Admin','Manager','Staff'].includes(user.role)){const hidden=await list('/inventory/products?availability=unavailable');setUnavailable(hidden.map(p=>({...p,category:p.category?.name||'',images:(p.images||[]).map(i=>({id:i.id,name:i.name,url:fileUrl(i.id)}))})));const m=await list('/stock-movements');setMovements(m.map(m=>({...m,name:m.product?.name||'Archived product',sku:m.product?.sku||'',source:m.reason,date:m.createdAt})))}else {setMovements([]);setUnavailable([])}},[user])
 useEffect(()=>{Promise.resolve().then(refresh).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[refresh])
 async function mutation(task){try{await task();await refresh();setError('');return null}catch(e){setError(e.message);return e.message}}
 function categoryId(name){const row=categoryRows.find(c=>c.name===name||c.id===name);if(!row)throw new Error('Choose an existing category.');return row.id}
 async function imageIds(images){return Promise.all(images.map(async i=>{if(!i.url.startsWith('data:'))return i.id;const blob=await (await fetch(i.url)).blob();return (await upload(new File([blob],i.name,{type:blob.type}),'product')).id}))}
 return <InventoryContext.Provider value={{products,loading,error,adminProducts:[...products,...unavailable],setAvailability:(id,active)=>mutation(()=>api('/products/'+id+'/availability',{method:'PATCH',body:{active}})),categories:categoryRows.map(c=>c.name),movements,refresh,
 saveCategory:(name,previous)=>mutation(()=>{const id=categoryRows.find(c=>c.name===previous)?.id;return api('/categories'+(id?'/'+id:''),{method:id?'PATCH':'POST',body:{name}})}),
 deleteCategory:name=>mutation(()=>api('/categories/'+categoryId(name),{method:'DELETE'})),
 addProduct:product=>mutation(async()=>api('/products',{method:'POST',body:{...product,category:categoryId(product.category),images:await imageIds(product.images||[])}})),
 updateProduct:(id,values)=>mutation(async()=>api('/products/'+id,{method:'PATCH',body:{...values,category:categoryId(values.category),...(values.images?{images:await imageIds(values.images)}:{})}})),
 adjustStock:(product,quantity,reason)=>mutation(()=>api('/stock-adjustments',{method:'POST',body:{product,quantity,reason}}))
 }}>{error&&<p role="alert" className="bg-red-100 p-4 text-red-800">{error} <button onClick={()=>refresh().then(()=>setError('')).catch(e=>setError(e.message))}>Retry</button></p>}{children}</InventoryContext.Provider>
}
