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
    files: {
        type: [Schema.Types.ObjectId],
        ref: "File"
    },
    promptFolder: {
        type: [Schema.Types.ObjectId],
        ref: "PromptFolder"
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
        type: [Schema.Types.ObjectId],
        ref: 'Thread'
    },
    assistants: {
        type: [Schema.Types.ObjectId],
        ref: 'Assistant'
    },
    defaultAssistant: {
        type: Schema.Types.ObjectId,
        ref: "Assistant"
    },
    lastVisitedThread: {
        type: Schema.Types.ObjectId,
        ref: "Thread"
    },
    teamInvitations: {
        type: [Schema.Types.ObjectId],
        ref: "User"
    },
}, { timestamps: true })

TeamSchema.set('toJSON', helper.formatModelResponse())

export default model('Team', TeamSchema)
