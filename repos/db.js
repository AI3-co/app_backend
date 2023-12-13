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

        console.log('UpdateResource()', { resource, data })
        let currentModel = await model.findByIdAndUpdate(resourceID, data, { new: true })
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

        console.log({ resource, data })

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
        let foundResource = await model.find().populate('teams')
        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error updating resource', error: error.message, success: false }
    }
}


export async function getResourceById(model, resource) {
    try {
        console.log({ resource })
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

