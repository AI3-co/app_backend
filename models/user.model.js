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
    microsoftEmail: {
        unique: true,
        type: String,
    },
    microsoftPassword: {
        type: String,
    },
    googleEmail: {
        unique: true,
        type: String,
    },
    googlePassword: {
        type: String,
    },
    role: {
        type: String,
        default: 'user'
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
        trim: true,
        required: true,
    },
    teams: {
        type: [Schema.Types.ObjectId],
        ref: "Team"
    },
    selectedOrganization: {
        type: Schema.Types.ObjectId,
        ref: "Organization"
    },
    organizations: {
        type: [Schema.Types.ObjectId],
        ref: 'Organization'
    }
}, { timestamps: true })


UserSchema.set('toJSON', helpers.formatModelResponse())

export default model('User', UserSchema)
// name, email, organization, password, skills, profile image,
