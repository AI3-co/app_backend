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

  sendServerSuccessResponse(responseObject, statusCode, payload, message) {
    responseObject.status(statusCode).json({ data: payload, message })
  }

  sendServerErrorResponse(responseObject, statusCode, error, message) {
    responseObject.status(statusCode).json({ error: error, message })
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
