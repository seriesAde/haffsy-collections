import test from 'node:test'
import assert from 'node:assert/strict'
import { generateSku } from '../src/features/inventory/sku.js'
test('generates normalized codes with optional variants', () => {
 assert.equal(generateSku({ name: 'Classic Abaya', type: 'Abaya', color: 'Black', size: 'XL' }), 'ABA-CLA-BLA-XL-001')
 assert.equal(generateSku({ name: 'Caf? dress!', type: 'Dress' }), 'DRE-CAF-001')
})
test('skips existing codes regardless of case and whitespace', () => {
 assert.equal(generateSku({ name: 'Classic', type: 'Abaya' }, ['aba-cla-001', ' ABA-CLA-002 ']), 'ABA-CLA-003')
})
test('requires usable name and type', () => {
 assert.equal(generateSku({ name: '!!!', type: 'Dress' }), '')
 assert.equal(generateSku({ name: 'Dress', type: '' }), '')
})
