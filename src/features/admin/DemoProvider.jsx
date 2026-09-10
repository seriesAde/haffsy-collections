import { useState } from 'react'
import { DemoContext } from './DemoContext'
import { customers as customerSeed, users as userSeed, invoices as invoiceSeed, defaultSettings } from './demoData'
import { initialQuotations } from '../quotations/data'
export default function DemoProvider({children}) {
 const [orders,setOrders]=useState({})
 const [customers,setCustomers]=useState(customerSeed),[users,setUsers]=useState(userSeed),[invoices,setInvoices]=useState(invoiceSeed),[quotations,setQuotations]=useState(initialQuotations),[settings,setSettings]=useState(defaultSettings)
 return <DemoContext.Provider value={{orders,setOrders,customers,setCustomers,users,setUsers,invoices,setInvoices,quotations,setQuotations,settings,setSettings}}>{children}</DemoContext.Provider>
}
