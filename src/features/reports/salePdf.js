import { jsPDF } from 'jspdf'

export function createSalePdf(sale, business, receiptUrl) {
  const { order, payments = [], paid, total, balance, paymentStatus } = sale
  const invoice = sale.invoice || order.invoiceSnapshot
  const doc = new jsPDF()
  let y = 22
  const cash = value => `${invoice.currency} ${Number(value || 0).toFixed(2)}`
  const date = value => value ? new Date(value).toLocaleString('en-GB') : 'Not recorded'
  function text(value, bold = false) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 12 : 10)
    for (const line of doc.splitTextToSize(String(value), 170)) {
      if (y > 274) { doc.addPage(); y = 22 }
      doc.text(line, 20, y); y += 6
    }
  }
  function section(title) { y += 5; text(title, true) }
  doc.setProperties({ title: `Sale report ${invoice.number}`, author: business.name })
  text('SALE REPORT', true)
  text(business.name, true)
  text([business.address, business.city, business.phone, business.email].filter(Boolean).join(' | '))
  section('Sale and customer')
  text(`Invoice: ${invoice.number} | Order: ${order.id}`)
  text(`Created: ${date(order.createdAt)} | Due: ${date(invoice.due)}`)
  text(`Customer: ${invoice.customerName || order.contact?.name || 'Not supplied'}`)
  const contact = order.contact || order.guestContact || invoice.guestContact || {}
  text(`Phone: ${contact.phone || 'Not supplied'} | Email: ${contact.email || 'Not supplied'}`)
  text(`Payment status: ${paymentStatus} | Invoice status: ${invoice.status}`)
  section('Items')
  for (const line of invoice.lines || []) {
    text(line.name, true)
    text(`Quantity: ${line.quantity} | Unit price: ${cash(line.price)} | Amount: ${cash(Math.round(line.price * 100) * line.quantity / 100)}`)
  }
  section('Totals')
  text(`Subtotal: ${cash(invoice.subtotal)} | Tax (${invoice.taxRate || 0}%): ${cash(invoice.tax)}`)
  text(`Invoice total: ${cash(invoice.amount)} | Delivery: ${cash(order.deliveryFee)}`)
  text(`Order total: ${cash(total)} | Verified received: ${cash(paid)} | Balance: ${cash(balance)}`, true)
  section('Fulfillment')
  text(`Method: ${order.method} | Stage: ${order.stage}`)
  text(`Location: ${order.location || 'Pickup'}`)
  text(`Delivery fee confirmed: ${order.feeConfirmed ? 'Yes' : 'No'}`)
  text(`Rider: ${order.rider?.name || order.rider || 'Unassigned'}`)
  section('Payments and proof of payment')
  if (!payments.length) text('No payments recorded.')
  for (const payment of payments) {
    text(`${payment.method} | ${cash(payment.amount)} | ${payment.status}`, true)
    text(`Reference: ${payment.id} | Recorded: ${date(payment.createdAt)}`)
    text(`Recorded by: ${payment.recordedBy?.name || payment.recordedBy || 'Not recorded'}`)
    text(`Reviewed by: ${payment.reviewedBy?.name || payment.reviewedBy || 'Not recorded'}`)
    if (payment.evidence) {
      text(`Receipt reference: ${payment.evidence.id || payment.evidence}`)
      if (y > 274) { doc.addPage(); y = 22 }
      doc.setTextColor(135, 20, 220)
      doc.textWithLink('Open proof of payment (authorized sign-in required)', 20, y, { url: receiptUrl(payment.evidence.id || payment.evidence) })
      doc.setTextColor(0); y += 6
    } else text('No receipt attached.')
  }
  section('Order timeline')
  for (const event of order.timeline || []) text(`${event.stage} | ${date(event.at)} | Actor: ${event.actor?.name || event.actor || 'Guest'}`)
  section('Notes')
  text(invoice.notes || 'No additional notes.')
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) { doc.setPage(page); doc.setFontSize(8); doc.text(`Sale ${invoice.number} | Page ${page} of ${pages}`, 20, 290) }
  return doc
}
