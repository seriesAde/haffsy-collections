import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../server.js';
import Product from '../models/product.model.js';
import Invoice from '../models/invoice.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Settings from '../models/settings.model.js';
import StockMovement from '../models/stockMovement.model.js';

const origin = 'http://localhost:5173';
const app = createApp({ origin, jwtSecret: 'test-only-secret-'.repeat(4), production: false });
const productId = '507f1f77bcf86cd799439011';
const input = { items: [{ product: productId, quantity: 2 }], method: 'Delivery', location: '10 Example Street', contact: { name: 'Guest', phone: '+2349000000000', email: 'guest@example.com' } };
const checkout = body => request(app).post('/api/checkout').set('Origin', origin).send(body);

test('guests must provide contact details and a delivery address', async () => {
    const missingContact = { ...input };
    delete missingContact.contact;
    assert.equal((await checkout(missingContact)).status, 400);
    assert.equal((await checkout({ ...input, location: '' })).status, 400);
    assert.equal((await checkout({ ...input, contact: { name: ' ', phone: '1' } })).status, 400);
});

test('guest checkout uses server prices and creates no user account', async t => {
    const saved = {};
    t.mock.method(mongoose.connection, 'transaction', async work => work({}));
    t.mock.method(Settings, 'findOne', () => ({ session: async () => ({ taxRate: 10, currency: 'NGN' }) }));
    t.mock.method(Product, 'findOneAndUpdate', async (filter, update) => {
        assert.equal(filter.stock.$gte, 2);
        assert.equal(update.$inc.stock, -2);
        return { id: productId, name: 'Server product', price: 250 };
    });
    for (const [Model, key] of [[Invoice, 'invoice'], [Order, 'order'], [StockMovement, 'movement']]) {
        t.mock.method(Model, 'create', async rows => {
            const document = new Model(rows[0]);
            await document.validate();
            saved[key] = document;
            return [document];
        });
    }
    const createUser = t.mock.method(User, 'create', () => { throw new Error('Guest checkout must not create an account'); });
    const response = await checkout(input);
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.receipt.amount, 550);
    assert.equal(saved.invoice.customer, undefined);
    assert.equal(saved.order.customer, undefined);
    assert.equal(saved.order.guestContact.email, input.contact.email);
    assert.equal(saved.order.contact.phone, input.contact.phone);
    assert.equal(saved.movement.guestCheckout, true);
    assert.equal(saved.movement.actor, undefined);
    assert.equal(createUser.mock.callCount(), 0);
});

test('guest checkout rejects client prices and account IDs', async () => {
    assert.equal((await checkout({ ...input, customer: productId })).status, 400);
    assert.equal((await checkout({ ...input, items: [{ product: productId, quantity: 1, price: 0 }] })).status, 400);
});

test('guest checkout leaves order reads and payments private', async () => {
    assert.equal((await request(app).get('/api/orders')).status, 401);
    assert.equal((await request(app).get('/api/orders/' + productId)).status, 401);
    assert.equal((await request(app).post('/api/orders/' + productId + '/payments').set('Origin', origin).send({ amount: 5, method: 'Cash' })).status, 401);
    assert.equal((await checkout(input).set('Cookie', 'session=invalid')).status, 401);
});
