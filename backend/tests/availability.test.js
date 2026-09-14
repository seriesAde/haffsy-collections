import test from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { getProducts, setProductAvailability } from '../Controllers/product.controller.js';
import { updateFulfillment, updateOrderStage } from '../Controllers/order.controller.js';

const id = '507f1f77bcf86cd799439011';
const next = error => { throw error; };

test('unavailable products are private and public lists filter them out', async t => {
    const filters = [];
    t.mock.method(Product, 'find', filter => {
        filters.push(filter);
        const query = { populate() { return this; }, sort() { return this; }, skip() { return this; }, limit: async () => [] };
        return query;
    });
    t.mock.method(Product, 'countDocuments', async () => 0);
    const res = { json() {} };
    await getProducts({ query: {} }, res, next);
    assert.equal(filters[0].active, true);
    await assert.rejects(() => getProducts({ query: { availability: 'unavailable' } }, res, next), /Staff access/);
    await getProducts({ query: { availability: 'unavailable' }, user: { role: 'Admin' } }, res, next);
    assert.equal(filters[1].active, false);
});

test('availability can be disabled and restored without deleting the product', async t => {
    t.mock.method(Product, 'findByIdAndUpdate', async (productId, values) => {
        assert.equal(productId, id);
        return { id, ...values };
    });
    for (const active of [false, true]) {
        let saved;
        await setProductAvailability({ params: { id }, body: { active } }, { json(body) { saved = body.data; } }, next);
        assert.equal(saved.active, active);
    }
});

test('completed orders cannot change fulfillment or restart their timeline', async t => {
    t.mock.method(Order, 'findOneAndUpdate', async filter => {
        assert.equal(filter.stage, 'Packing');
        return null;
    });
    await assert.rejects(() => updateFulfillment({ params: { id }, body: { method: 'Pickup', deliveryFee: 0 } }, {}, next), /Only packing orders/);
    for (const [method, stage] of [['Delivery', 'Received'], ['Pickup', 'Collected']]) {
        t.mock.method(Order, 'findById', async () => ({ id, method, stage }));
        await assert.rejects(() => updateOrderStage({ params: { id }, user: { role: 'Admin' }, body: { stage: 'Packing' } }, {}, next), /Invalid next order stage/);
    }
});
