import mongoose from "mongoose";

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Middleware} next
 * @param {Object} resource
 * @param {Boolean} customLoad - This flag allows this method to use a prepacked object instead of the req
 * @returns
 */
export async function createResource(model, data) {
    try {
        let resourceToBeSaved = await model(data)
        const savedResource = await resourceToBeSaved.save()
        return { resource: savedResource, success: true }
    } catch (error) {
        return { msg: 'Error creating resource', error: error.message, success: false }
    }
}

export async function updateResource(model, resource, data) {
    try {
        let resourceID = resource.id

        if (!resourceID) return { msg: 'No Resource ID supplied', success: false }

        let currentModel = await model.findByIdAndUpdate(resourceID, data, { new: true })
        console.log('UpdateResource()', { resource, data, currentModel })

        return { resource: currentModel, success: true }
    } catch (error) {
        return { msg: 'Error updating resource', error: error.message, success: false }
    }
}

/**
 *
 * @param {*} model - The database model that is to be updated
 * @param {*} resource - This represents the resource that is being updated like the ID and so on...
 * @param {Object} data - Uses fieldToUpdate, and newData
 * @returns
 */
export async function pushUpdatesToResource(model, resource, data = { fieldToUpdate: '', newData: [] }) {
    try {
        const foundResource = await model.findById(resource.id)
        const { fieldToUpdate, newData } = data
        if (!foundResource) return { success: false, error: 'Could not find resource' }

        newData.forEach(_data => {
            foundResource[fieldToUpdate].push(_data)
        })

        console.log({ foundResource })

        await foundResource.save()

        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error making push updates to resource', error: error.message, success: false }
    }
}

export async function deleteResource(req, res, next, resource) {
    try {

    } catch (error) {

    }
}

// change this to get all unfiltered records back
// export async function getResources(req, res, next, resource) {
//     try {
//         let resourceID = req.params.id

//         if (!resourceID) res.status(400).json({ msg: 'No resource ID provided' })
//         let foundResource = await resource.model.findById(resourceID)
//         res.status(200).json({ msg: resource.message, data: foundResource })
//         return { resource: foundResource, success: true }
//     } catch (error) {
//         return res.status(400).json({ msg: 'Error fetching resource', error: error.message })
//     }
// }

export async function getAllResources(model, resource) {
    try {
        let foundResource = await model.find()
        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error updating resource', error: error.message, success: false }
    }
}

export async function getSingleResourceAndPopulateFields(model, resource, fields = []) {
    try {
        let query = model.findById(resource.id)

        fields.forEach(field => {
            query = query.populate(field)
        })

        const populatedResources = await query.exec()
        return { resource: populatedResources, success: true }
    } catch (error) {
        return { msg: 'Error finding and populating resource', error: error.message, success: false }
    }
}

export async function getAllResourceAndPopulateRefFields(model, fields = [], filter) {
    try {
        let query = model.find()

        if (filter) query = model.find(filter)

        fields.forEach(field => {
            query = query.populate(field)
        })

        const populatedResources = await query.exec()
        return { resource: populatedResources, success: true }
    } catch (error) {
        return { msg: 'Error finding and populating resource', error: error.message, success: false }
    }
}

/**
 *
 * @param {*} model
 * @param {*} resource - Requires field & value
 */

export async function getManyResourcesByField(model, resource) {
    try {
        const { field, value } = resource
        // consoel.log({ field, value })
        let foundResource = await model.find({ [field]: value }).populate(field)
        return { resource: foundResource, success: true }
    } catch (error) {
        throw Error('Error getting many resources')
    }
}

export async function getResourceByField(model, resource) {
    try {
        const { field, value } = resource
        let foundResource = await model.findOne({ [field]: value })
        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error locating resource by field', error: error.message, success: false }
    }
}




export async function getResourceById(model, resource) {
    try {
        if (!resource.id)
            return { msg: 'Error, no resource ID supplied', error: error.message, success: false }
        let foundResource = await model.findById(resource.id)
        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error fetching single resource', error: error.message, success: false }
    }
}



// export async function updateResource(req, res, next, resource) {
//     try {

//     } catch (error) {

//     }
// }

