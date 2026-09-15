import test from 'node:test';
import assert from 'node:assert/strict';
import Order from '../models/order.model.js';
import { updateOrderStage, updateFulfillment } from '../Controllers/order.controller.js';
const id = '507f1f77bcf86cd799439011';
const other = '507f1f77bcf86cd799439012';
const next = error => { throw error; };
const res = { json() {} };

test('customer can receive only their dispatched delivery, with safe retries', async t => {
    const order = { id, customer: id, method: 'Delivery', stage: 'Packing' };
    t.mock.method(Order, 'findById', async () => order);
    const update = t.mock.method(Order, 'findOneAndUpdate', async (_, values) => {
        order.stage = values.$set.stage;
        return order;
    });
    const req = { params: { id }, user: { id, role: 'Customer' }, body: { stage: 'Received' } };
    await assert.rejects(() => updateOrderStage(req, res, next), /only confirm/);
    order.stage = 'Sent out';
    req.user.id = other;
    await assert.rejects(() => updateOrderStage(req, res, next), /Access denied/);
    req.user.id = id;
    req.body.stage = 'Packing';
    await assert.rejects(() => updateOrderStage(req, res, next), /only confirm/);
    req.body.stage = 'Received';
    await updateOrderStage(req, res, next);
    await updateOrderStage(req, res, next);
    assert.equal(update.mock.callCount(), 1);
    assert.equal(order.stage, 'Received');
});

test('manual rider can be saved and dispatched; pickup clears rider information', async t => {
    const order = { id, method: 'Delivery', stage: 'Packing' };
    t.mock.method(Order, 'findById', async () => order);
    t.mock.method(Order, 'findOneAndUpdate', async (_, values) => {
        Object.assign(order, values.$set || values);
        return order;
    });
    const req = { params: { id }, user: { id, role: 'Admin' }, body: { method: 'Delivery', location: 'Ilorin', deliveryFee: 1000, manualRider: { name: 'Rider', phone: '09000000000' } } };
    await updateFulfillment(req, res, next);
    assert.equal(order.manualRider.phone, '09000000000');
    req.body = { stage: 'Sent out' };
    await updateOrderStage(req, res, next);
    assert.equal(order.stage, 'Sent out');
    order.stage = 'Packing';
    req.body = { method: 'Pickup', deliveryFee: 0 };
    await updateFulfillment(req, res, next);
    assert.equal(order.manualRider, null);
    assert.equal(order.rider, null);
});
