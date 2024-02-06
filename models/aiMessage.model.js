import { Schema, model } from 'mongoose'
import { MESSAGE_ENTITY_ROLE } from '../helpers/enum.js'

const AIMessageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true
    },
    type: {
        type: String,
        default: 'assistant'
    },
    oaiMessageID: {
        type: String,
        required: true
    }
}, { timestamps: true })



export default model('AIMessage', AIMessageSchema)
