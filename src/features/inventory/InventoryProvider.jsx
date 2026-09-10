import { useState } from 'react'
import { InventoryContext } from './InventoryContext'
import { initialMovements, initialProducts } from './data'
export default function InventoryProvider({children}) {
 const [categories,setCategories]=useState([...new Set(initialProducts.map(p=>p.category))])
 const [products,setProducts]=useState(initialProducts)
 const [movements,setMovements]=useState(initialMovements)
 function saveCategory(name,previous){
  name=name.trim()
  if(!name)return 'Enter a category name.'
  if(categories.some(c=>c!==previous&&c.toLowerCase()===name.toLowerCase()))return 'This category already exists.'
  setCategories(current=>previous?current.map(c=>c===previous?name:c):[...current,name])
  if(previous)setProducts(current=>current.map(p=>p.category===previous?{...p,category:name}:p))
  return null
 }
 function deleteCategory(name){
  if(products.some(p=>p.category===name))return 'Reassign the products in this category before deleting it.'
  setCategories(current=>current.filter(c=>c!==name));return null
 }
 function addProduct(product){
  if(!categories.includes(product.category))return 'Choose an existing category or create one in Categories.'
  if([...products,...initialMovements].some(p=>p.sku.toLowerCase()===product.sku.toLowerCase())) return 'A product with this SKU already exists.'
  const id=crypto.randomUUID()
  setProducts(current=>[...current,{...product,id}])
  if(product.stock>0) setMovements(current=>[{id,name:product.name,sku:product.sku,type:'in',quantity:product.stock,source:product.supplier||'Opening stock',date:new Date().toISOString()},...current])
  return null
 }
 function updateProduct(id,values){if(!categories.includes(values.category))return 'Choose an existing category.';setProducts(current=>current.map(p=>p.id===id?{...p,...values}:p))}
 function adjustStock(id,quantity,reason){const product=products.find(p=>p.id===id);if(!product)return 'Choose a product.';if(!Number.isSafeInteger(quantity)||quantity===0)return 'Enter a non-zero whole number.';if(!reason.trim())return 'Enter a reason.';if(product.stock+quantity<0)return 'Stock cannot be negative.';setProducts(current=>current.map(p=>p.id===id?{...p,stock:p.stock+quantity}:p));setMovements(current=>[{id:crypto.randomUUID(),name:product.name,sku:product.sku,type:'adjustment',quantity,source:reason.trim(),date:new Date().toISOString()},...current]);return null}
 return <InventoryContext.Provider value={{products,movements,addProduct,updateProduct,adjustStock,categories,saveCategory,deleteCategory}}>{children}</InventoryContext.Provider>
}
