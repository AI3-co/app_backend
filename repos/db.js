import mongoose from "mongoose";
import Organization from "../models/organization.model.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";



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

// handle team creation with invitations
export async function createTeamWithInvitations(data) {
    try {
      const teamToBeSaved = await Team(data);
      const savedTeam = await teamToBeSaved.save();
      return { team: savedTeam, success: true };
    } catch (error) {
      return { msg: 'Error creating team', error: error.message, success: false };
    }
  }


  

export async function updateResource(model, resource, data) {
    try {

        // console.log({ updatePayload: { data, resource } })

        let resourceID = resource.id

        if (!resourceID) return { msg: 'No Resource ID supplied', success: false }

        let currentModel = await model.findByIdAndUpdate(resourceID, data, { new: true })
        // console.log('UpdateResource()', { resource, data, currentModel })

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

        // console.log({ foundResource })

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

export async function getAllResources(model, filter) {
    try {
        let foundResource

        if (filter) {
            console.log('Has filter: ', filter)
            foundResource = await model.find(filter)
            console.log({ seen: foundResource })
        }

        foundResource = await model.find()

        console.log()

        return { resource: foundResource, success: true }
    } catch (error) {
        return { msg: 'Error updating resource', error: error.message, success: false }
    }
}

// Populate invitation link 
export async function getAllTeams(filter) {
    try {
      let foundTeams;
  
      if (filter) {
        console.log('Has filter: ', filter);
        foundTeams = await Team.find(filter).populate('invitations.inviter invitations.invitee');
        console.log({ seen: foundTeams });
      }
  
      foundTeams = await Team.find().populate('invitations.inviter invitations.invitee');
  
      console.log();
  
      return { teams: foundTeams, success: true };
    } catch (error) {
      return { msg: 'Error updating teams', error: error.message, success: false };
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
        console.log(filter)
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


// x
// Helper function to retrieve invitation details from the database

export async function getInvitationDetailsFromDatabase(invitationToken) {
    try {
        // Verify and decode the token
        const decoded = jwt.verify(invitationToken, process.env.JWT_SECRET_KEY);
        console.log('Decoded Invitation Token:', decoded);

        // Get the invitation details from the decoded token
        const organizationID = decoded.organizationID;
        const email = decoded.email;
        const accessLevel = decoded.accessLevel;

        // Log the email to check if it's correct
        console.log('Email:', email);

        // Fetch the user from the database using the email
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User not found.');
        }
        const userID = user._id;

        // Log the userID and accessLevel
        console.log('userID:', userID);
        console.log('accessLevel:', accessLevel);

        // Logic to get invitation details from database
        const updateResult = await Organization.updateOne({ _id: organizationID, 'teamInvitations.token': invitationToken }, { $set: { 'teamInvitations.$.status': 'accepted' } });

        // Return the necessary details
        return { organizationID, email, userID, accessLevel };
    } catch (error) {
        console.error('Error in getInvitationDetailsFromDatabase:', error);
        throw error;
    }
}

export async function associateUserWithTeam(organizationID, email, userID, accessLevel) {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            console.error('User not found for email:', email);
            throw new Error('User not found.');
        }

        // Log the userID, accessLevel, and email
        console.log('userID:', user._id);
        console.log('accessLevel:', accessLevel);
        console.log('email:', email);

        // Convert userID to ObjectId if it's a string
        if (typeof userID === 'string') {
            userID = mongoose.Types.ObjectId(userID);
        }

        // Logic to associate user with team
        const updateResult = await Organization.updateOne(
            { _id: organizationID },
            { $push: { members: user._id } } // Only push the user's ObjectId
        );
        

        if (updateResult.nModified === 0) {
            throw new Error('Invalid organization ID.');
        }

        return updateResult;
    } catch (error) {
        console.error('Error in associateUserWithTeam:', error);
        throw error; // Re-throw the error for further handling
    }
}