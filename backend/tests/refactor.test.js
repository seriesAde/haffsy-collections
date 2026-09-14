import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server.js';
import asyncHandler from '../utilities/asyncHandler.js';
import ApiError from '../utilities/apiErrors.js';
import Upload from '../models/upload.model.js';
import User from '../models/user.model.js';

const config = { origin: 'http://localhost:5173', jwtSecret: 'test-secret-'.repeat(5), production: false };
const app = createApp(config);

test('asyncHandler forwards synchronous and asynchronous errors once', async () => {
    for (const handler of [() => { throw new ApiError(400, 'Invalid'); }, async () => { throw new ApiError(403, 'Denied'); }]) {
        const errors = [];
        await asyncHandler(handler)({}, {}, error => errors.push(error));
        assert.equal(errors.length, 1);
        assert.ok(errors[0] instanceof ApiError);
        assert.equal(errors[0].status, errors[0].statusCode);
    }
});

test('explicit commerce routes preserve authentication requirements', async () => {
    for (const [method, path] of [
        ['get', '/quotations'], ['get', '/invoices'],
        ['get', '/quotations/abc'], ['get', '/invoices/abc'],
        ['post', '/quotations'], ['post', '/invoices'],
        ['patch', '/quotations/abc'], ['patch', '/invoices/abc'],
        ['post', '/quotations/abc/convert'], ['get', '/orders'],
        ['patch', '/orders/abc'], ['post', '/orders/abc/stage'],
        ['post', '/orders/abc/payments'], ['post', '/payments/abc/review'],
    ]) {
        const response = await request(app)[method]('/api' + path).set('Origin', config.origin);
        assert.equal(response.status, 401, method + ' ' + path);
    }
});

test('private evidence does not bypass authentication after metadata lookup', async t => {
    t.mock.method(Upload, 'findById', () => ({ select: async () => ({ purpose: 'payment', owner: 'someone', data: Buffer.from('private') }) }));
    const response = await request(app).get('/api/uploads/507f1f77bcf86cd799439011');
    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'Please sign in.');
});

test('schema rewrite preserves public ids and strips password hashes', () => {
    const user = new User({ name: 'Test', email: 'test@example.com', passwordHash: 'private' });
    const serialized = user.toJSON();
    assert.equal(serialized.id, user.id);
    assert.equal(serialized.passwordHash, undefined);
    assert.equal(serialized._id, undefined);
});

test('separate app instances retain their own cookie configuration', async () => {
    const secureApp = createApp({ ...config, production: true });
    const secure = await request(secureApp).post('/api/auth/logout').set('Origin', config.origin);
    const local = await request(app).post('/api/auth/logout').set('Origin', config.origin);
    assert.match(secure.headers['set-cookie'][0], /Secure/);
    assert.doesNotMatch(local.headers['set-cookie'][0], /Secure/);
});
