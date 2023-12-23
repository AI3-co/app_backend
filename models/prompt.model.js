import { Schema, model } from 'mongoose'

const PromptSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    folder: {
        type: [Schema.Types.ObjectId],
        ref: "PromptFolder"
    }
}, { timestamps: true })

export default model('Prompt', PromptSchema)
