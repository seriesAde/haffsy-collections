import { createHash, randomUUID } from 'node:crypto';
import { cloudinaryConfig } from '../config/cloudinary.js';
import ApiError from '../utilities/apiErrors.js';

function baseUrl(config) {
    return `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}`;
}

async function request(url, options) {
    try {
        const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
        if (!response.ok) throw new Error('Cloudinary request failed');
        return response;
    } catch {
        throw new ApiError(502, 'Cloudinary could not process the file. Check your media configuration and try again.');
    }
}

export async function uploadMedia(buffer, mime, purpose) {
    const config = cloudinaryConfig();
    const resourceType = mime === 'application/pdf' ? 'raw' : 'image';
    const type = purpose === 'payment' ? 'authenticated' : 'upload';
    const form = new FormData();
    form.set('file', new Blob([buffer], { type: mime }), mime === 'application/pdf' ? 'receipt.pdf' : 'image');
    form.set('public_id', `haf-siyy/${purpose}/${randomUUID()}${resourceType === 'raw' ? '.pdf' : ''}`);
    form.set('type', type);
    form.set('overwrite', 'false');
    const response = await request(`${baseUrl(config)}/${resourceType}/upload`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64') },
        body: form
    });
    const result = await response.json();
    if (!result.asset_id || !result.public_id) throw new ApiError(502, 'Cloudinary returned incomplete upload metadata.');
    return { assetId: result.asset_id, publicId: result.public_id, resourceType, type };
}

export async function downloadMedia(asset) {
    const config = cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = { asset_id: asset.assetId, expires_at: timestamp + 60, timestamp };
    const signature = createHash('sha1').update(Object.keys(parameters).sort().map(key => `${key}=${parameters[key]}`).join('&') + config.apiSecret).digest('hex');
    const query = new URLSearchParams({ ...parameters, signature, api_key: config.apiKey });
    const response = await request(`${baseUrl(config)}/asset/download?${query}`);
    return Buffer.from(await response.arrayBuffer());
}

export async function destroyMedia(asset) {
    const config = cloudinaryConfig();
    await request(`${baseUrl(config)}/${asset.resourceType}/destroy`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64') },
        body: new URLSearchParams({ public_id: asset.publicId, type: asset.type })
    });
}
