import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudinaryConfig } from '../config/cloudinary.js';
import { uploadMedia, downloadMedia } from '../services/cloudinary.service.js';
import { sendFile } from '../Controllers/uploads.controller.js';
import Upload from '../models/upload.model.js';

test('missing Cloudinary credentials return an actionable configuration error', () => {
    assert.throws(() => cloudinaryConfig({}), /CLOUDINARY_CLOUD_NAME/);
});

test('uploads use authenticated receipt storage and raw PDFs; downloads are signed', async t => {
    const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const previous = keys.map(key => process.env[key]);
    keys.forEach(key => { process.env[key] = 'test-only'; });
    t.after(() => keys.forEach((key, index) => {
        if (previous[index] === undefined) delete process.env[key];
        else process.env[key] = previous[index];
    }));
    const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        calls.push({ url, options });
        if (options?.method === 'POST') return new Response(JSON.stringify({ asset_id: 'asset', public_id: 'receipt.pdf' }));
        return new Response('receipt bytes');
    });
    const asset = await uploadMedia(Buffer.from('%PDF-test'), 'application/pdf', 'payment');
    assert.equal(calls[0].options.body.get('type'), 'authenticated');
    assert.match(calls[0].url, /raw\/upload$/);
    assert.equal((await downloadMedia(asset)).toString(), 'receipt bytes');
    const url = new URL(calls[1].url);
    assert.equal(url.searchParams.get('asset_id'), 'asset');
    assert.match(url.searchParams.get('signature'), /^[a-f0-9]{40}$/);
    assert.ok(Number(url.searchParams.get('expires_at')) > Number(url.searchParams.get('timestamp')));
    await uploadMedia(Buffer.from('image'), 'image/png', 'product');
    assert.equal(calls[2].options.body.get('type'), 'upload');
});

test('legacy files still validate and serve without Cloudinary', async () => {
    const file = new Upload({ owner: '507f1f77bcf86cd799439011', purpose: 'payment', mime: 'image/png', data: Buffer.from('legacy') });
    await file.validate();
    let result;
    const headers = {};
    await sendFile({ upload: file }, { set(key, value) { headers[key] = value; return this; }, send(value) { result = value; } }, error => { throw error; });
    assert.equal(result.toString(), 'legacy');
    assert.equal(headers['Cache-Control'], 'private, no-store');
    const cloud = new Upload({ owner: file.owner, purpose: 'payment', cloudinary: { assetId: 'asset', publicId: 'receipt', resourceType: 'image', type: 'authenticated' } });
    await cloud.validate();
});
