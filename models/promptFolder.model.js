import { Schema, model } from 'mongoose'

const PromptFolderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    prompts: {
        type: [Schema.Types.ObjectId],
        ref: "Prompt"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

export default model('PromptFolder', PromptFolderSchema)
