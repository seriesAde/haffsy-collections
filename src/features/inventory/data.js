export const initialMovements = [
 ['Laptop Stand Pro','LSP-001','in',50,'Supplier A','2026-01-28T10:30:00'],
 ['Wireless Mouse X','WMX-045','out',-15,'Order #1234','2026-01-28T09:15:00'],
 ['Office Chair Premium','OCP-100','in',25,'Supplier B','2026-01-27T15:45:00'],
 ['USB-C Cable 2m','USC-200','out',-100,'Order #1235','2026-01-27T14:20:00'],
 ['Desk Organizer Set','DOS-050','in',30,'Supplier A','2026-01-26T11:00:00'],
 ['Mechanical Keyboard','MKB-300','adjustment',-5,'Stock Audit','2026-01-26T09:30:00'],
 ['Monitor 27 inch 4K','MON-270','out',-8,'Order #1236','2026-01-25T16:15:00'],
 ['Ergonomic Mouse Pad','EMP-025','in',75,'Supplier C','2026-01-25T13:00:00'],
].map(([name,sku,type,quantity,source,date],id)=>({id,name,sku,type,quantity,source,date}))

// Demo stock snapshot; movement rows are a partial history, not a full stock ledger.
export const initialProducts = initialMovements.map((m,i)=>({id:'product-'+i,name:m.name,sku:m.sku,category:'Home & Office',price:[89.99,29.99,299.9,9.99,24.99,79.99,449.99,19.99][i],stock:[5,8,25,12,30,40,15,75][i],reorder:[20,25,10,50,10,10,5,20][i]}))
