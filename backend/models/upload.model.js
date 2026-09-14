import mongoose from 'mongoose';
const uploadSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    purpose: {
        type: String,
        enum: ['product', 'payment'],
        required: true
    },
    name: {
        type: String
    },
    mime: {
        type: String
    },
    size: {
        type: Number
    },
    data: {
        type: Buffer,
        required: true,
        select: false
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(_doc, value) {
            delete value._id;
            delete value.__v;
            delete value.passwordHash;
            return value;
        }
    }
});
const Upload = mongoose.model('Upload', uploadSchema);
export default Upload;
