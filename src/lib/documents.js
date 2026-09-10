export function calculateTotals(lines,taxRate) {
 const subtotalCents=lines.reduce((sum,line)=>sum+Math.round(Number(line.price)*100)*Number(line.quantity),0)
 const taxCents=Math.round(subtotalCents*Number(taxRate)/100)
 return {subtotal:subtotalCents/100,tax:taxCents/100,total:(subtotalCents+taxCents)/100}
}
export function money(value,currency='USD'){return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(value)}
export function downloadDocument(doc){
 const lines=[doc.id,'Customer: '+doc.customer,'Date: '+doc.date,'Due/valid until: '+(doc.due||''),...(doc.lines||[]).map(l=>l.name+' x '+l.quantity+' @ '+money(l.price,doc.currency)),'Total: '+money(doc.amount,doc.currency),'Status: '+doc.status,doc.notes||'']
 const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=doc.id+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
