import mongoose from 'mongoose';
export async function connectDatabase(uri) {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000
    });
}
