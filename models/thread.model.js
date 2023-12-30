import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const ThreadSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: 'Untitled', // use ai to automate title generation
    },
    messages: {
        type: [Schema.Types.ObjectId],
        ref: "Message",
        required: true
    },
    tags: {
        type: [],
    },
    oaiThreadID: {
        type: String,
        required: true
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true
    }
}, { timestamps: true })

// ThreadSchema.virtual()

ThreadSchema.set('toJSON', helper.formatModelResponse())

export default model('Thread', ThreadSchema)
