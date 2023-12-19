import { Schema, model } from 'mongoose'
import Helper from '../helpers/helpers.js'

const helper = new Helper()

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: "User"
    },
    teams: {
        type: [Schema.Types.ObjectId],
        ref: "Team"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true })

OrganizationSchema.set('toJSON', helper.formatModelResponse())

export default model('Organization', OrganizationSchema)
