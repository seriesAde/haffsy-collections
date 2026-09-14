export function existingCustomerId(row, previous, customers) {
  // Creation forms supply customerName; loaded documents supply customer.
  // Only reuse a saved association when editing that same customer.
  const customer = customers.find(customer => customer.name === row.customer)
  if (customer) return customer.id
  return previous && previous.customer === row.customer ? previous.customerId : null
}
