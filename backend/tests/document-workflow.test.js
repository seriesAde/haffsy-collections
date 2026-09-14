import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Invoice from '../models/invoice.model.js';
import Quotation from '../models/quotation.model.js';
import Order from '../models/order.model.js';
import { createInvoice, moveInvoiceToOrder } from '../Controllers/invoice.controller.js';
import { createQuotation, convertQuotation } from '../Controllers/quotation.controller.js';
import { documentInput } from '../services/documentInput.service.js';

const id = '507f1f77bcf86cd799439011';
const input = { guestContact: { name: 'Walk-in customer', phone: '09000000000', email: '' }, lines: [{ name: 'Item', quantity: 2, price: 100 }], due: '2026-10-01', taxRate: 10, currency: 'NGN' };
const req = { params: { id }, user: { id, role: 'Admin' }, body: input };
const next = error => { throw error; };

test('document validation accepts blank optional email and rejects missing contact', () => {
    assert.equal(documentInput.parse(input).guestContact.email, undefined);
    assert.equal(documentInput.safeParse({ ...input, guestContact: undefined }).success, false);
    assert.equal(documentInput.safeParse({ ...input, customer: id }).success, false);
});

test('guest quotations and invoices save without automatically creating orders', async t => {
    t.mock.method(mongoose.connection, 'transaction', async work => work({}));
    const orderCreate = t.mock.method(Order, 'create', async () => { throw new Error('Must use Move to orders'); });
    for (const [Model, handler] of [[Quotation, createQuotation], [Invoice, createInvoice]]) {
        t.mock.method(Model, 'create', async rows => {
            const record = new Model(rows[0]);
            await record.validate();
            return [record];
        });
        let data;
        await handler(req, { status() { return this; }, json(body) { data = body.data; } }, next);
        assert.equal(data.customerName, input.guestContact.name);
        assert.equal(data.guestContact.phone, input.guestContact.phone);
        assert.equal(data.amount, 220);
    }
    assert.equal(orderCreate.mock.callCount(), 0);
});

test('quotation conversion preserves guest details and does not create an order', async t => {
    const quote = new Quotation({ ...documentInput.parse(input), number: 'QUO-TEST', customerName: 'Walk-in customer', subtotal: 200, tax: 20, amount: 220 });
    t.mock.method(mongoose.connection, 'transaction', async work => work({}));
    t.mock.method(Quotation, 'findById', () => ({ session: async () => quote }));
    t.mock.method(quote, 'save', async () => quote);
    t.mock.method(Invoice, 'exists', () => ({ session: async () => false }));
    t.mock.method(Invoice, 'create', async rows => { const invoice = new Invoice(rows[0]); await invoice.validate(); return [invoice]; });
    const create = t.mock.method(Order, 'create', async () => { throw new Error('Unexpected order'); });
    let data;
    await convertQuotation(req, { status() { return this; }, json(body) { data = body.data; } }, next);
    assert.equal(data.guestContact.phone, input.guestContact.phone);
    assert.equal(quote.status, 'Accepted');
    assert.equal(create.mock.callCount(), 0);
});

test('move to orders retains invoice and does not duplicate an existing order', async t => {
    const invoice = new Invoice({ ...documentInput.parse(input), number: 'INV-TEST', customerName: 'Walk-in customer', amount: 220 });
    let saved;
    t.mock.method(mongoose.connection, 'transaction', async work => work({}));
    t.mock.method(Invoice, 'findByIdAndUpdate', async () => invoice);
    t.mock.method(Order, 'findOne', () => ({ session: async () => saved }));
    const create = t.mock.method(Order, 'create', async rows => { saved = new Order(rows[0]); await saved.validate(); return [saved]; });
    const res = { json() {} };
    await moveInvoiceToOrder(req, res, next);
    await moveInvoiceToOrder(req, res, next);
    assert.equal(create.mock.callCount(), 1);
    assert.equal(String(saved.invoice), invoice.id);
    assert.equal(saved.invoiceSnapshot.number, invoice.number);
    assert.equal(saved.stage, 'Packing');
});
