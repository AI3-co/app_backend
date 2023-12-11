import { Schema, model } from 'mongoose'

const ThreadSchema = new Schema({
    messages: {
        type: [Schema.Types.ObjectId],
        ref: 'Message'
    },
    threadId: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model('Thread', ThreadSchema)
