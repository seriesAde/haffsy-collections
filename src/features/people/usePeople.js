import { useState } from 'react'
import { useDemo } from '../admin/DemoContext'
export function usePeople(kind){
 const demo=useDemo(),rows=kind==='user'?demo.users:demo.customers
 const [query,setQuery]=useState(''),[dialog,setDialog]=useState(null),[notice,setNotice]=useState('')
 async function save(value){try{await demo.savePerson(value,kind);setDialog(null);setNotice('Account saved.')}catch(e){return e.message}}
 async function remove(id){try{await demo.removePerson(id);setDialog(null);setNotice('Account deactivated.')}catch(e){setNotice(e.message)}}
 return {rows,filtered:rows.filter(r=>(r.name+' '+r.email).toLowerCase().includes(query.toLowerCase())),query,setQuery,dialog,setDialog,notice,save,remove}
}
