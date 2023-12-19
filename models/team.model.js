import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const TeamSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        require: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: "User"
    },
    threads: {
        type: [Schema.Types.Object],
        ref: "Thread"
    },
    assistants: {
        type: [Schema.Types.ObjectId],
        ref: 'Assistant'
    },
    defaultAssistant: {
        type: Schema.Types.ObjectId,
        ref: "Assistant"
    }
}, { timestamps: true })

TeamSchema.set('toJSON', helper.formatModelResponse())

export default model('Team', TeamSchema)
