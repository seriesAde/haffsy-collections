import { useState } from 'react'
import { useDemo } from '../admin/DemoContext'
export function usePeople(kind){
 const demo=useDemo(),user=kind==='user',rows=user?demo.users:demo.customers,setRows=user?demo.setUsers:demo.setCustomers
 const [query,setQuery]=useState(''),[dialog,setDialog]=useState(null),[notice,setNotice]=useState('')
 function save(value){if(rows.some(r=>r.id!==value.id&&r.email.toLowerCase()===value.email.toLowerCase()))return 'This email already exists.';setRows(current=>value.id?current.map(r=>r.id===value.id?value:r):[...current,{...value,id:crypto.randomUUID(),status:'Active',orders:0,spent:0,lastLogin:'Never'}]);setDialog(null);setNotice(user?'Demo user saved. Login access is not provisioned.':'Customer saved.')}
 function remove(id){setRows(current=>current.filter(r=>r.id!==id));setDialog(null);setNotice('Record removed from the demo workspace.')}
 return {rows,filtered:rows.filter(r=>(r.name+' '+r.email).toLowerCase().includes(query.toLowerCase())),query,setQuery,dialog,setDialog,notice,save,remove}
}
