import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    organzations: {
        type: [Schema.Types.ObjectId],
        ref: 'Organization'
    }
}, { timestamps: true })

export default model('User', UserSchema)
// name, email, organization, password, skills, profile image,
