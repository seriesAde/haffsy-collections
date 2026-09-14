import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: 'business'
    },
    name: {
        type: String,
        default: 'Haf_siyy Collection'
    },
    email: {
        type: String,
        default: 'hafsatadebukola2@gmail.com'
    },
    phone: {
        type: String,
        default: '+234 907 342 3542'
    },
    address: {
        type: String,
        default: 'NO108 Ajiboye Street'
    },
    city: {
        type: String,
        default: 'Ilorin, Kwara State'
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    taxRate: {
        type: Number,
        default: 0
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
const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
