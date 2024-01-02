import { MESSAGE_ENTITY_ROLE } from "./enum.js"

class Helper {
  formatModelResponse(doc, returnedDoc) {
    return {
      transform: (_, returnedDoc) => {
        returnedDoc.id = returnedDoc?._id.toString()
        delete returnedDoc._id
        delete returnedDoc.__v
        delete returnedDoc.password
      }
    }
  }

  /**
   *
   * @param {*} message
   * @param {*} users
   * @param {*} assistants
   * @returns
   */
  handleCreatorPopulation(message = {}, users = [], assistants = []) {
    // console.log({ message, users, assistants })
    let populatedMessage
    if (message.role === MESSAGE_ENTITY_ROLE.USER) {
      const currentUser = users.filter(user => user._id.toString() === message.createdBy.toString())[0]
      populatedMessage = {
        content: message.content,
        thread: message.thread,
        createdBy: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName
        },
        role: message.role,
        oaiMessageID: message.oaiMessageID,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        id: message._id
      }

      return populatedMessage
    } else if (message.role === MESSAGE_ENTITY_ROLE.ASSISTANT) {
      const currentAssistant = assistants.filter(assistant => assistant._id.toString() === message.createdBy.toString())[0]
      populatedMessage = {
        content: message.content,
        thread: message.thread,
        createdBy: {
          name: currentAssistant.name
        },
        role: message.role,
        oaiMessageID: message.oaiMessageID,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        id: message._id
      }
      return populatedMessage
    }
  }

  sendServerSuccessResponse(responseObject, statusCode, payload, message) {
    responseObject.status(statusCode).json({ data: payload, message })
  }

  sendServerErrorResponse(responseObject, statusCode, error, message) {
    responseObject.status(statusCode).json({ error, message })
  }

  sendServerResponse(responseObject, statusCode, payload) {
    responseObject.status(statusCode).json(payload)
  }

}

export default Helper

/*
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
*/
