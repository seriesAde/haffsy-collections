import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useDemo } from '../../admin/DemoContext'
import { Field } from '../../admin/components/AdminUI'
import { primaryClass,inputClass } from '../../admin/components/styles'
import { Link } from 'react-router'
import { money } from '../../../lib/documents'
export default function AccountPage(){
 const {user,updateProfile,logout}=useAuth(),{invoices,orders}=useDemo(),[notice,setNotice]=useState('')
 async function save(e){e.preventDefault();try{await updateProfile(Object.fromEntries(new FormData(e.currentTarget)));setNotice('Profile saved.')}catch(e){setNotice(e.message)}}
 return <><h1 className="mb-6 text-3xl font-bold">Your profile</h1><p className="mb-4">{user.email}</p><button className={primaryClass} onClick={()=>logout().catch(e=>setNotice(e.message))}>Sign out</button><div className="mt-6 grid gap-7 lg:grid-cols-2"><form onSubmit={save} className="space-y-4 rounded-xl border border-outline p-6">{['name','phone','address'].map(name=><Field key={name} label={name}><input name={name} defaultValue={user[name]||''} className={inputClass}/></Field>)}<button className={primaryClass}>Save profile</button><p role="status">{notice}</p></form><section className="space-y-5"><h2 className="text-xl font-bold">Your orders</h2>{!invoices.length&&<p>No orders yet.</p>}{invoices.filter(i=>orders[i.id]).map(i=><article key={i.id} className="space-y-4 rounded-xl border border-outline p-6"><h3>{i.id}</h3><p>{money(i.amount,i.currency)}</p><Link className="text-accent" to={"/orders/"+i.id}>View order details</Link></article>)}</section></div></>
}
