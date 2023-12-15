import { Schema, model } from "mongoose";
import Helper from "../helpers/helpers.js";

const helpers = new Helper()

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    teams: {
        type: [Schema.Types.ObjectId],
        ref: 'Teams'
    },
    organzations: {
        type: [Schema.Types.ObjectId],
        ref: 'Organization'
    }
}, { timestamps: true })


UserSchema.set('toJSON', helpers.formatModelResponse())

export default model('User', UserSchema)
// name, email, organization, password, skills, profile image,
