import mongoose from "mongoose";
// USE HERE AS THE BASIC FOR CRUD OPERATIONS
// EXTEND IT FOR REUSABILITY

class BaseController {
    _model = null
    constructor(model) {
        if (new.target === BaseController) {
            throw new TypeError('Cannot construct Abstract instances directly')
        }
        this._model = model
        this.create = this.create.bind(this)
    }
    // getAllResources
    // getResourceById
    async create(req, res, next) {
        let dataObj = req.body
        const validator = this._model.validateCreate(dataObj)

        if (validator.passes()) {
            let modelObj = new this._model(dataObj)
            try {
                const savedObj = await modelObj.save()
                return res.status(201).json(savedObj)
            } catch (error) {
                return next(error)
            }

        } else {
            return res.status(400)
        }
    }
    // updateResourceById
    // deleteResourceBYId
    // createNewResource
}

export default BaseController
