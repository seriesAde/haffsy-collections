import mongoose from 'mongoose';
import { readConfig } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './server.js';
import * as models from './models/index.js';
try {
    const config = readConfig();
    await connectDatabase(config.mongoUri);
    // Ensure unique indexes exist before accepting writes.
    await Promise.all(Object.values(models).map(model => model.init()));
    const server = createApp(config).listen(config.port, () => console.log('API listening on port ' + config.port));
    async function shutdown() {
        server.close(async () => {
            await mongoose.disconnect();
            process.exit(0);
        });
    }
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
} catch (error) {
    console.error('API startup failed. Check Atlas access, MONGODB_URI, and environment configuration.');
    console.error(error);
    await mongoose.disconnect();
    process.exitCode = 1;
}
