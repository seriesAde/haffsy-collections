import mongoose from 'mongoose';
const quotationSchema = new mongoose.Schema({
    number: {
        type: String,
        unique: true,
        required: true
    },
    guestContact: { type: new mongoose.Schema({
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true }
    }, { _id: false }) },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.guestContact?.name; }
    },
    customerName: {
        type: String
    },
    lines: [new mongoose.Schema({
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number }
    }, { _id: false })],
    amount: {
        type: Number
    },
    subtotal: {
        type: Number
    },
    tax: {
        type: Number
    },
    taxRate: {
        type: Number
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    due: {
        type: Date
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
