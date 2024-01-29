import { Schema, model } from 'mongoose'

const PromptSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    folder: {
        type: [Schema.Types.ObjectId],
        ref: "PromptFolder",
        required: true
    }
}, { timestamps: true })

export default model('Prompt', PromptSchema)
