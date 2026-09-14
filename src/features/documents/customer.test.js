import test from 'node:test'
import assert from 'node:assert/strict'
import { existingCustomerId } from './customer.js'

test('new invoice and quotation contact does not require an existing document', () => {
  assert.equal(existingCustomerId({ customerName: 'Walk-in' }, undefined, []), null)
})
test('editing preserves a registered customer and clears it when the name changes', () => {
  const previous = { customer: 'Customer', customerId: 'customer-id' }
  assert.equal(existingCustomerId({ customer: 'Customer' }, previous, []), 'customer-id')
  assert.equal(existingCustomerId({ customer: 'Other' }, previous, []), null)
})
