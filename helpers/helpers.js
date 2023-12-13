class Helper {
  formatModelResponse(doc, returnedDoc) {
    return {
      transform: (_, returnedDoc) => {
        returnedDoc.id = returnedDoc?._id.toString()
        delete returnedDoc._id
        delete returnedDoc.__v
      }
    }
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
