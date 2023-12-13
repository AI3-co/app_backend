import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers'

const helper = new Helper()

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

ThreadSchema.set('toJSON', helper.formatModelResponse())

export default model('Thread', ThreadSchema)
