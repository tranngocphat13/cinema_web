import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default: "Customer"
    },
}, { timestamps: true });

const User = models.User || mongoose.model('User', userSchema);
export default User;
