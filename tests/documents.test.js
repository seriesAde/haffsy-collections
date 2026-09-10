import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateTotals } from '../src/lib/documents.js'
test('totals multiple lines and rounds tax to currency precision',()=>{
 assert.deepEqual(calculateTotals([{quantity:3,price:19.99},{quantity:2,price:4.5}],10),{subtotal:68.97,tax:6.9,total:75.87})
})
test('handles decimal prices without floating point currency drift',()=>{
 assert.deepEqual(calculateTotals([{quantity:3,price:0.1}],0),{subtotal:0.3,tax:0,total:0.3})
})
test('supports form string inputs, fractional tax and empty documents',()=>{
 assert.deepEqual(calculateTotals([{quantity:'2',price:'10.00'}],'7.5'),{subtotal:20,tax:1.5,total:21.5})
 assert.deepEqual(calculateTotals([],10),{subtotal:0,tax:0,total:0})
})
