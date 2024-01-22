import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const AssistantSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'assistant'
    },
    alias: {
        type: String,
    },
    openaiID: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    llmType: {
        type: String
    },
    permittedMembers: {
        type: String,
    },
    instructions: {
        type: String,
        required: true
    },
    retrieval: {
        type: Boolean,
        default: false
    },
    files: {
        type: [String],
    },
    teams: {
        type: [Schema.Types.ObjectId],
        ref: 'Teams',
        required: true
    }
}, { timestamps: true })

AssistantSchema.set('toJSON', helper.formatModelResponse())

export default model('Assistant', AssistantSchema)
