import { Schema, model } from 'mongoose'

const TeamSchema = new Schema({
    name: {
        type: String,
        require: true
    },
}, { timestamps: true })

export default model('', TeamSchema)
