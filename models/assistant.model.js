import { Schema, model } from 'mongoose'

const AssistantSchema = new Schema({
    name: {
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
    instructions: {
        type: String,
        required: true
    },
    retrival: {
        type: Boolean,
        required: true
    },
    files: {
        type: [String],
        required: true
    },

}, { timestamps: true })

export default model('Assistant', AssistantSchema)
