import { Schema, model } from 'mongoose'

const MessageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default model('Message', MessageSchema)
