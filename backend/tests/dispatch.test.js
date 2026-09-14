import test from 'node:test';
import assert from 'node:assert/strict';
import Order from '../models/order.model.js';
import { updateOrderStage } from '../Controllers/order.controller.js';

test('dispatch requires a saved rider, succeeds once, and allows safe retries', async t => {
    const id = '507f1f77bcf86cd799439011';
    const order = { id, method: 'Delivery', stage: 'Packing', rider: null };
    t.mock.method(Order, 'findById', async () => order);
    const update = t.mock.method(Order, 'findOneAndUpdate', async (filter, values) => {
        assert.equal(filter.stage, 'Packing');
        assert.equal(values.$push.timeline.stage, 'Sent out');
        order.stage = values.$set.stage;
        return order;
    });
    const req = { params: { id }, user: { id, role: 'Admin' }, body: { stage: 'Sent out' } };
    let result;
    const res = { json(body) { result = body.data; } };
    await assert.rejects(() => updateOrderStage(req, res, error => { throw error; }), /Select a rider/);
    assert.equal(update.mock.callCount(), 0);
    order.rider = id;
    await updateOrderStage(req, res, error => { throw error; });
    assert.equal(result.stage, 'Sent out');
    await updateOrderStage(req, res, error => { throw error; });
    assert.equal(update.mock.callCount(), 1);
});
