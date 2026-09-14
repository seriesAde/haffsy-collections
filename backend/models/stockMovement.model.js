import mongoose from 'mongoose';
const stockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['in', 'out', 'adjustment'],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    guestCheckout: { type: Boolean, default: false },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.guestCheckout; }
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
const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
