import mongoose from 'mongoose';
const lineSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number }
}, { _id: false });
const invoiceSnapshotSchema = new mongoose.Schema({
    number: { type: String },
    guestContact: {
        type: new mongoose.Schema({
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            email: { type: String, trim: true }
        }, { _id: false })
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String },
    lines: [lineSchema],
    amount: { type: Number },
    subtotal: { type: Number },
    tax: { type: Number },
    taxRate: { type: Number },
    currency: { type: String, default: 'NGN' },
    due: { type: Date },
    notes: { type: String },
    status: { type: String, default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }
}, { _id: false });
const orderSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        unique: true
    },
    invoiceSnapshot: {
        type: invoiceSnapshotSchema,
        default: null
    },
    guestContact: {
        type: new mongoose.Schema({
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            email: { type: String, trim: true }
        }, { _id: false })
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.guestContact?.name; }
    },
    contact: {
        name: { type: String },
        phone: { type: String },
        email: { type: String }
    },
    method: {
        type: String,
        enum: ['Delivery', 'Pickup'],
        required: true
    },
    location: {
        type: String
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    feeConfirmed: {
        type: Boolean,
        default: false
    },
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    manualRider: {
        name: { type: String, trim: true, maxlength: 100 },
        phone: { type: String, trim: true, maxlength: 40 }
    },
    stage: {
        type: String,
        enum: ['Packing', 'Sent out', 'Received', 'Ready for pickup', 'Collected'],
        default: 'Packing'
    },
    timeline: [{
        stage: {
            type: String
        },
        at: {
            type: Date
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
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
const Order = mongoose.model('Order', orderSchema);
export default Order;
