import { Schema, model } from 'mongoose'

const ChatSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    messages: {
        type: [Schema.Types.ObjectId],
        ref: 'Message'
    },
    participants: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    }
}, { timestamps: true })

export default model('Chat', ChatSchema)
