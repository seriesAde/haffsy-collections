import { useState } from 'react'
import { StoreContext } from './StoreContext'
import { useInventory } from '../inventory/InventoryContext'
export default function StoreProvider({children}){
 const {products}=useInventory();const [cart,setCart]=useState([]),[wishlist,setWishlist]=useState([]),[profile,setProfile]=useState({name:'',email:'',phone:'',address:''}),[history,setHistory]=useState([]),[notice,setNotice]=useState('')
 function add(id,quantity=1){const p=products.find(p=>p.id===id);const current=cart.find(c=>c.id===id)?.quantity||0;if(!p||!Number.isInteger(quantity)||quantity<1||current+quantity>p.stock){setNotice('That quantity is unavailable.');return false}setCart(rows=>rows.some(r=>r.id===id)?rows.map(r=>r.id===id?{...r,quantity:r.quantity+quantity}:r):[...rows,{id,quantity}]);setNotice(p.name+' added to your cart.');return true}
 function quantity(id,n){const p=products.find(p=>p.id===id);if(!p||!Number.isInteger(n)||n<1||n>p.stock){setNotice('Choose a quantity between 1 and available stock.');return}setCart(rows=>rows.map(r=>r.id===id?{...r,quantity:n}:r))}
 const items=cart.map(c=>({...c,product:products.find(p=>p.id===c.id)}));const subtotal=items.reduce((n,c)=>n+Math.round((c.product?.price||0)*100)*c.quantity,0)/100
 return <StoreContext.Provider value={{cart,items,subtotal,add,quantity,remove:id=>setCart(rows=>rows.filter(r=>r.id!==id)),clear:()=>setCart([]),wishlist,toggleWish:id=>setWishlist(rows=>rows.includes(id)?rows.filter(r=>r!==id):[...rows,id]),profile,setProfile,history,setHistory,notice,setNotice}}>{children}</StoreContext.Provider>
}
