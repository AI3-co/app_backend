import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const AssistantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: true
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
