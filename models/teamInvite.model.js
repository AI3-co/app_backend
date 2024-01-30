// import mongoose, { Schema } from 'mongoose';
import mongoose from 'mongoose';

const TeamInviteSchema = new mongoose.Schema({
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    accessLevel: {
        type: String,
        enum: ['admin', 'member'],
        required: true
    },
    token: String, // for invitation link/token
    expirationDate: Date
});

export default mongoose.model('TeamInvite', TeamInviteSchema);