import { jsPDF } from 'jspdf'

// Currency codes keep amounts readable in the built-in PDF font, including NGN.
const cash = (amount, currency) => currency + ' ' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateLabel = value => value ? new Date(value + (value.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export function createInvoicePdf(invoice, business, kind = 'invoice') {
  const label = kind === 'quotation' ? 'QUOTATION' : 'INVOICE'
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const currency = invoice.currency || 'USD'
  const left = 20, right = 190, bottom = 270
  let y = 24
  function text(value, x, at, size = 10, bold = false, align = 'left') {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(20, 20, 20)
    doc.text(String(value), x, at, { align })
  }
  function pageBreak(height) {
    if (y + height > bottom) { doc.addPage(); y = 24; text(label + ' ' + invoice.id + ' - continued', left, y, 10, true); y += 12 }
  }
  function wrapped(value, x, width, size = 10, bold = false) {
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(String(value), width)
    for (const line of lines) { pageBreak(6); text(line, x, y, size, bold); y += 6 }
  }
  doc.setProperties({ title: label + ' ' + invoice.id, author: business.name, subject: 'Customer invoice' })
  text(label, right, 30, 24, true, 'right')
  wrapped(business.name || 'Haf_siyy Collection', left, 92, 20, true)
  y = Math.max(y + 10, 48)
  for (const detail of [business.address, business.city, business.phone, business.email].filter(Boolean)) wrapped(detail, left, 94, 10)
  const contactBottom = y
  text('Number: ' + invoice.id, right, 49, 10, false, 'right')
  text('Issue Date: ' + dateLabel(invoice.date), right, 56, 10, false, 'right')
  text((kind === 'quotation' ? 'Valid Until: ' : 'Due Date: ') + dateLabel(invoice.due), right, 63, 10, true, 'right')
  y = Math.max(contactBottom + 18, 97)
  wrapped('Customer: ' + invoice.customer, left, 170, 11, true)
  y += 3
  wrapped((kind === 'quotation' ? 'Quotation Status: ' : 'Invoice Status: ') + invoice.status, left, 170, 10)
  y += 13
  const columns = [20, 72, 88, 118, 138, 190]
  function tableHeader() {
    text('Item', columns[0], y, 9, true); text('Qty', columns[1], y, 9, true)
    text('Rate', columns[2], y, 9, true); text('Discount', columns[3], y, 9, true)
    text('Tax (%)', columns[4], y, 9, true); text('Price', columns[5], y, 9, true, 'right')
    y += 6; doc.setDrawColor(220); doc.line(left, y, right, y); y += 7
  }
  pageBreak(22); tableHeader()
  const detailed = Boolean(invoice.lines?.length)
  const lines = detailed ? invoice.lines : [{ name: 'Invoice total (item breakdown unavailable)', quantity: 1, price: invoice.amount }]
  const taxRate = detailed ? Number(invoice.taxRate || 0) : 0
  let subtotalCents = 0, totalQuantity = 0
  for (const line of lines) {
    const qty = Number(line.quantity), price = Number(line.price)
    const cents = Math.round(price * 100) * qty
    subtotalCents += cents; totalQuantity += qty
    doc.setFontSize(9)
    const names = doc.splitTextToSize(String(line.name), 46)
    // Split very long descriptions across pages rather than clipping them.
    let first = true
    while (names.length) {
      if (y + 12 > bottom) { pageBreak(13); tableHeader() }
      const count = Math.max(1, Math.floor((bottom - y - 5) / 5))
      const segment = names.splice(0, count)
      segment.forEach((name, i) => text(name, left, y + i * 5, 9))
      if (first) {
        text(qty, 72, y, 8); text(cash(price, currency), 88, y, 7)
        text('-', 121, y, 8); text(taxRate || '-', 138, y, 8)
        text(cash((cents + Math.round(cents * taxRate / 100)) / 100, currency), right, y, 7, true, 'right')
        first = false
      }
      y += Math.max(segment.length * 5, 8) + 4
    }
  }
  pageBreak(70)
  text('Total', left, y, 9, true); text(totalQuantity, 72, y, 9, true)
  const subtotal = subtotalCents / 100
  const tax = Math.round(subtotalCents * taxRate / 100) / 100
  const total = Number(invoice.amount)
  const paid = invoice.status === 'Paid' ? total : Number(invoice.paid || 0)
  y += 12
  for (const [label, value] of [['Subtotal:', subtotal], ...(tax ? [['Tax:', tax]] : []), ['Total:', total], ...(kind === 'quotation' ? [] : [['Paid:', paid], ['Credit Note:', 0], ['Due Amount:', Math.max(0, total - paid)]])]) {
    pageBreak(9); text(label, 125, y, 9, true); text(cash(value, currency), right, y, 9, true, 'right'); y += 9
  }
  if (invoice.notes) { y += 8; pageBreak(15); wrapped('Notes & Terms', left, 170, 10, true); wrapped(invoice.notes, left, 170, 9) }
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) { doc.setPage(i); text('Page ' + i + ' of ' + pages, right, 286, 8, false, 'right') }
  return doc
}

export function downloadInvoicePdf(invoice, business, kind = 'invoice') {
  createInvoicePdf(invoice, business, kind).save(invoice.id.replace(/[^a-zA-Z0-9_-]/g, '') + '.pdf')
}
