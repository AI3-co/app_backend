import { Schema, model } from 'mongoose'

const MessageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    oaiMessageID: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model('Message', MessageSchema)
