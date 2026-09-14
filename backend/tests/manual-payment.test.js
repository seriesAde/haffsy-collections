import test from 'node:test';
import assert from 'node:assert/strict';
import { recordPayment } from '../Controllers/payment.controller.js';
import { paymentSummary } from '../services/payment.service.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import Upload from '../models/upload.model.js';

test('payments cannot be recorded without valid owned proof', async t => {
    const id = '507f1f77bcf86cd799439011';
    t.mock.method(Order, 'findById', async () => ({ id, customer: id }));
    t.mock.method(Upload, 'exists', async () => false);
    const create = t.mock.method(Payment, 'create', async () => { throw new Error('Must not save'); });
    for (const evidence of [undefined, id]) {
        await assert.rejects(() => recordPayment({
            params: { id }, user: { id, role: 'Admin' },
            body: { amount: 100, method: 'Cash', ...(evidence ? { evidence } : {}) }
        }, {}, error => { throw error; }));
    }
    assert.equal(create.mock.callCount(), 0);
});

test('admin confirms receipts while customer submissions remain pending', async t => {
    const id = '507f1f77bcf86cd799439011';
    t.mock.method(Order, 'findById', async () => ({ id, customer: id }));
    t.mock.method(Upload, 'exists', async filter => {
        assert.equal(filter.owner, id);
        assert.equal(filter.purpose, 'payment');
        return true;
    });
    t.mock.method(Payment, 'create', async values => values);
    for (const role of ['Admin', 'Customer', 'Staff']) {
        let result;
        const res = { status(code) { assert.equal(code, 201); return this; }, json(body) { result = body.data; } };
        await recordPayment({ params: { id }, user: { id, role }, body: { amount: 100, method: 'Transfer', evidence: id } }, res, error => { throw error; });
        assert.equal(result.status, role === 'Admin' ? 'Verified' : 'Pending');
        assert.equal(result.reviewedBy, role === 'Admin' ? id : undefined);
        assert.equal(result.evidence, id);
    }
});

test('only confirmed payments cover the full order including delivery', () => {
    const order = { deliveryFee: 20, feeConfirmed: true };
    const invoice = { amount: 100 };
    const partial = [{ amount: 80, status: 'Verified' }, { amount: 40, status: 'Pending' }];
    assert.deepEqual(paymentSummary(order, invoice, partial), { paid: 80, total: 120, balance: 40, paymentStatus: 'Partial' });
    const paid = [...partial, { amount: 40, status: 'Verified' }];
    assert.equal(paymentSummary(order, invoice, paid).paymentStatus, 'Paid');
    assert.equal(paymentSummary({ ...order, feeConfirmed: false }, invoice, paid).paymentStatus, 'Partial');
    assert.equal(paymentSummary(order, invoice, [{ amount: 120, status: 'Rejected' }]).paymentStatus, 'Unpaid');
});
