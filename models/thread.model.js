import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const ThreadSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messages: { // !TODO - Revert back to using a ref and ObjectID type
        type: [],
    },
    oaiThreadID: {
        type: String,
        required: true
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: "Team",
    }
}, { timestamps: true })

ThreadSchema.set('toJSON', helper.formatModelResponse())

export default model('Thread', ThreadSchema)
