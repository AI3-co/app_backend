import { Schema, model } from 'mongoose'
import { MESSAGE_ENTITY_ROLE } from '../helpers/enum.js'

const MessageSchema = new Schema({
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
    role: {
        type: String,
        required: true,
        enum: ['assistant', 'user']
    },
    oaiMessageID: {
        type: String,
        required: true
    }
}, { timestamps: true })

// MessageSchema.virtual('createdByRef', {
//     ref: function (doc) {
//         console.log({ doc })
//         return doc.role === 'user' ? 'User' : 'Assistant'
//     },
//     localField: 'role',
//     foreignField: "_id",
// })

export default model('Message', MessageSchema)
