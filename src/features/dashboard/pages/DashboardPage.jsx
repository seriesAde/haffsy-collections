import { Package, FileText, Receipt, Users } from 'lucide-react'
import { useDemo } from '../../admin/DemoContext'
import { useInventory } from '../../inventory/InventoryContext'
import { PageHeading } from '../../admin/components/AdminUI'
import { money } from '../../../lib/documents'
import MetricCard from '../components/MetricCard'
import RecentActivity from '../components/RecentActivity'
import LowStockAlerts from '../components/LowStockAlerts'
export default function DashboardPage() {
 const {customers,quotations,invoices,settings}=useDemo(),{products,movements}=useInventory()
 const now=new Date(),month=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')
 const revenue=invoices.filter(i=>i.status==='Paid'&&i.date.startsWith(month)&&(i.currency||'USD')===settings.currency).reduce((sum,i)=>sum+i.amount,0)
 const activity=[...invoices.map(i=>({key:'invoice-'+i.id,type:'Invoice',label:i.id,description:i.customer,amount:money(i.amount,i.currency),status:i.status,date:i.date,to:'/admin/invoices'})),...quotations.map(q=>({key:'quote-'+q.id,type:'Quotation',label:q.id,description:q.customer,amount:money(q.amount,q.currency),status:q.status,date:q.date,to:'/admin/quotations'})),...movements.map(m=>({key:'stock-'+m.id,type:'Stock',label:m.sku,description:m.name,amount:(m.quantity>0?'+':'')+m.quantity+' units',status:m.quantity>0?'Added':'Adjusted',date:m.date,to:'/admin/stock-movements'}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4)
 const low=products.filter(p=>p.stock<=p.reorder).sort((a,b)=>a.stock-b.stock)
 return <><PageHeading title="Dashboard" subtitle="Welcome back! Here's what's happening today."/><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total Products" value={products.length.toLocaleString()} icon={Package} to="/admin/products" tone="bg-accent/10 text-accent" detail="Products in your inventory"/><MetricCard label="Active Quotations" value={quotations.filter(q=>q.status==='Pending').length} icon={FileText} to="/admin/quotations" tone="bg-blue-500/10 text-blue-500" detail="Awaiting a customer response"/><MetricCard label="Monthly Revenue" value={money(revenue,settings.currency)} icon={Receipt} to="/admin/sales-reports" tone="bg-emerald-500/10 text-emerald-600" detail={now.toLocaleDateString(undefined,{month:'long',year:'numeric'})+' paid invoices ? '+settings.currency}/><MetricCard label="Total Customers" value={customers.length.toLocaleString()} icon={Users} to="/admin/customers" tone="bg-background text-foreground" detail="All customer records"/></div><div className="grid items-stretch gap-6 xl:grid-cols-[2fr_1fr]"><RecentActivity items={activity}/><LowStockAlerts products={low}/></div></>
}
