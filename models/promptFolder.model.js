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
}, { timestamps: true })

export default model('PromptFolder', PromptFolderSchema)
