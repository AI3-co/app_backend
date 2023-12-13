import { Schema, model } from 'mongoose'

const FileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    downloadLink: {
        type: String,
        required: true
    },
    team: {
        type: Schema.Types.ObjectId,
        required: true
    }

}, { timestamps: true })

export default model('File', FileSchema)
