import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        default: 0,
        select: false
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    reorder: {
        type: Number,
        default: 0,
        min: 0
    },
    supplier: {
        type: String,
        select: false
    },
    barcode: {
        type: String
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Upload'
    }],
    active: {
        type: Boolean,
        default: true
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
const Product = mongoose.model('Product', productSchema);
export default Product;
