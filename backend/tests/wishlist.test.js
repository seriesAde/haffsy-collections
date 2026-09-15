import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server.js';
import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';
import { getWishlist, addWishlistItem, removeWishlistItem } from '../Controllers/wishlist.controller.js';
const user = '507f1f77bcf86cd799439011';
const product = '507f1f77bcf86cd799439012';
const req = { user: { id: user }, params: { product }, body: { user: 'another-account' } };
const next = error => { throw error; };
test('wishlist endpoints require authentication', async () => {
    const app = createApp({ origin: 'http://localhost:5173', jwtSecret: 'test-secret'.repeat(5), production: false });
    for (const [method,path] of [['get',''],['put','/'+product],['delete','/'+product]]) {
        assert.equal((await request(app)[method]('/api/wishlist'+path).set('Origin','http://localhost:5173')).status,401);
    }
});
test('reads and mutations use the authenticated account, not a supplied user ID', async t => {
    t.mock.method(Wishlist,'find',filter => {
        assert.deepEqual(filter,{user});
        return { select: () => ({ lean: async () => [{product}] }) };
    });
    let result;
    const res = { json: value => { result=value; } };
    await getWishlist(req,res,next);
    assert.deepEqual(result.data,[product]);
    t.mock.method(Product,'exists',async () => true);
    t.mock.method(Wishlist,'updateOne',async (filter,update,options) => {
        assert.deepEqual(filter,{user,product});
        assert.deepEqual(update,{$setOnInsert:{user,product}});
        assert.equal(options.upsert,true);
    });
    await addWishlistItem(req,res,next);
    t.mock.method(Wishlist,'deleteOne',async filter => assert.deepEqual(filter,{user,product}));
    await removeWishlistItem(req,res,next);
});
test('unavailable products cannot be added', async t => {
    t.mock.method(Product,'exists',async () => null);
    await assert.rejects(() => addWishlistItem(req,{json(){}},next), /unavailable/);
});
