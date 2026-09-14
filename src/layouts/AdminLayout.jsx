import { useAuth } from '../features/auth/AuthContext'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { BarChart3, Package, FileText, Receipt, Users, Settings, Menu, X } from 'lucide-react'
import ThemeToggle from '../features/theme/ThemeToggle'
import { cn } from '../lib/utils'
const groups = [
 { label:'Dashboard', icon:BarChart3, path:'/admin' },
 { label:'Inventory', icon:Package, links:[['All Products','/admin/products'],['Add Product','/admin/products/new'],['SKU Generator','/admin/sku-generator'],['Categories','/admin/categories'],['Stock Adjustment','/admin/stock-adjustments'],['Stock Movements','/admin/stock-movements']] },
 { label:'Quotations', icon:FileText, links:[['All Quotations','/admin/quotations'],['Create Quotation','/admin/quotations/new']] },
 { label:'Invoices & Sales', icon:Receipt, links:[['Orders & Payments','/admin/orders'],['All Invoices','/admin/invoices'],['Create Invoice','/admin/invoices/new'],['Sales Reports','/admin/sales-reports']] },
 { label:'Customers', icon:Users, path:'/admin/customers' },
 { label:'Admin', icon:Settings, links:[['Settings','/admin/settings'],['Users','/admin/users']] },
]
export default function AdminLayout() {
 const {user,logout}=useAuth()
 const [notice,setNotice]=useState('')
 const [open,setOpen]=useState(false)
 return <div className="min-h-svh bg-surface text-foreground">
 {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setOpen(false)}/>}
 <aside className={cn('fixed inset-y-0 left-0 z-40 w-60 overflow-y-auto border-r border-outline bg-background transition-transform lg:translate-x-0',open?'translate-x-0':'-translate-x-full')}>
 <div className="flex h-20 items-center justify-between border-b border-outline px-6"><span className="text-xl font-bold text-accent">Haf_siyy Collection</span><button className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
 <nav aria-label="Admin navigation" className="space-y-5 px-4 py-6">{groups.map(({label,icon:Icon,links,path})=><div key={label}>{path ? <NavLink end to={path} onClick={()=>setOpen(false)} className={({isActive})=>cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm',isActive?'bg-accent text-white hover:text-white':'text-muted hover:bg-avatar')}><Icon size={19}/>{label}</NavLink> : <div className="flex items-center gap-3 px-3 text-sm text-muted"><Icon size={19}/><span>{label}</span>{!links && <span className="sr-only">Not available yet</span>}</div>}{links && <div className="mt-2 space-y-0.5 pl-5">{links.map(([name,path])=>path?<NavLink end key={name} to={path} onClick={()=>setOpen(false)} className={({isActive})=>cn('block rounded-lg px-4 py-2 text-sm',isActive?'bg-accent text-white hover:text-white':'hover:bg-avatar')}>{name}</NavLink>:<span key={name} title="Coming soon" className="block px-4 py-2 text-sm text-muted">{name}</span>)}</div>}</div>)}</nav>
 </aside>
 <div className="lg:pl-60"><header className="flex h-16 items-center justify-between border-b border-outline px-5 lg:justify-end"><button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open navigation" aria-expanded={open}><Menu/></button><span className="mr-4 text-sm">{user.name} ({user.role})</span><button className="mr-4 text-sm" onClick={()=>logout().catch(e=>setNotice(e.message))}>Sign out</button><ThemeToggle/></header><main className="p-5 lg:p-7"><div className="mb-5 rounded-lg bg-background px-3 py-2 text-xs text-muted">Connected workspace. Changes are saved to the backend. {notice}</div><Outlet/></main></div>
 </div>
}
