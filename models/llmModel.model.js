import { Schema, model } from 'mongoose'

const LLMSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model('LLM', LLMSchema)
