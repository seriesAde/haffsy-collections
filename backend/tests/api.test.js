import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server.js';
import { totals, canTransition } from '../services/document.service.js';
import { detectMime } from '../middlewares/upload.middleware.js';
import { literalSearch } from '../utilities/validation.js';
const config = {
    origin: 'http://localhost:5173',
    jwtSecret: 'test-secret-only-'.repeat(4),
    production: false
};
const app = createApp(config);
test('checkout requires an account before processing an order', async () => {
    const res = await request(app).post('/api/checkout').set('Origin', config.origin).send({});
    assert.equal(res.status, 401);
});
test('health endpoint works without MongoDB and reports readiness honestly', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'disconnected');
    assert.equal(res.headers['x-powered-by'], undefined);
});
test('cross-site writes are rejected before route execution', async () => {
    const res = await request(app).post('/api/auth/login').set('Origin', 'https://untrusted.example').send({});
    assert.equal(res.status, 403);
});
test('registration cannot supply an administrator role', async () => {
    const res = await request(app).post('/api/auth/register').set('Origin', config.origin).send({
        name: 'Test',
        email: 'test@example.com',
        password: 'long-test-password',
        role: 'Admin'
    });
    assert.equal(res.status, 400);
});
test('inventory and users require authentication', async () => {
    for (const path of ['/api/products', '/api/categories', '/api/users']) {
        const res = await request(app).post(path).set('Origin', config.origin).send({});
        assert.equal(res.status, 401);
    }
});
test('invalid session is rejected', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'session=invalid');
    assert.equal(res.status, 401);
});
test('logout clears the HTTP-only session cookie', async () => {
    const res = await request(app).post('/api/auth/logout').set('Origin', config.origin);
    assert.equal(res.status, 204);
    assert.match(res.headers['set-cookie'][0], /HttpOnly/);
    assert.match(res.headers['set-cookie'][0], /SameSite=Lax/);
});
test('totals use cents and round tax', () => {
    assert.deepEqual(totals([{
        quantity: 3,
        price: 19.99
    }, {
        quantity: 2,
        price: 4.5
    }], 10), {
        subtotal: 68.97,
        tax: 6.9,
        amount: 75.87
    });
});
test('delivery transitions cannot skip stages or use pickup stages', () => {
    assert.equal(canTransition('Delivery', 'Packing', 'Sent out'), true);
    assert.equal(canTransition('Delivery', 'Packing', 'Received'), false);
    assert.equal(canTransition('Pickup', 'Ready for pickup', 'Collected'), true);
    assert.equal(canTransition('Delivery', 'Packing', 'Collected'), false);
});
test('file signatures reject executable or SVG payloads', () => {
    assert.equal(detectMime(Buffer.from('<svg></svg>')), null);
    assert.equal(detectMime(Buffer.from('%PDF-1.7')), 'application/pdf');
});
test('search escapes regex metacharacters', () => {
    const value = 'chair (XL) [new] .*';
    assert.equal(new RegExp(literalSearch(value)).test(value), true);
    assert.equal(new RegExp(literalSearch('.*')).test('anything'), false);
});
