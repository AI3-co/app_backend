import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const TeamSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'Members'
    },
    assistants: {
        type: [Schema.Types.ObjectId],
        ref: 'Assistants'
    }
}, { timestamps: true })

TeamSchema.set('toJSON', helper.formatModelResponse())

export default model('Team', TeamSchema)
