import Helper from "../helpers/helpers.js"
import Message from "../models/message.model.js"
import { getAllResources, getResourceById } from "../repos/db.js"

const helper = new Helper()

class MessageController {
    async getAllMessages(req, res, next) {
        try {
            const allMessages = await getAllResources(Message)
            helper.sendServerSuccessResponse(res, 200, allMessages.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, 'Error fetching all messages')
        }
    }

    async getSingleMessage(req, res, next) {
        try {
            const foundMessage = await getResourceById(Message, { id: req.params.id })
            // const
            helper.sendServerSuccessResponse(res, 200, foundMessage.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error fetching single message')
        }
    }

    async updateSingleMessage(req, res, next) { }
    async deleteSingleMessage(req, res, next) { }
}

export default MessageController
