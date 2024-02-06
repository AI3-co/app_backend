import Organization from "../../models/organization.model.js"
import TeamInvite from "../../models/teamInvite.model.js"
import { ObjectId } from 'mongodb'


// Function to save team invitation to the database
export async function saveTeamInvitationToDatabase(organizationID, email, invitedUserID, accessLevel) {
    try {
        // Validate and find the organization
        const organization = await Organization.findById(organizationID);
        if (!organization) {
            throw new Error(`Organization with ID ${organizationID} not found`);
        }

        // Use a resource method to create a new team invitation
        const teamInvite = await TeamInvite.createTeamInvite({
            organizationID,
            email,
            invitedUserID,
            accessLevel,
            status: 'pending',
        });

        // Ensure that the organization has the teamInvitations array
        if (!organization.teamInvitations) {
            organization.teamInvitations = [];
        }

        // Push the ID of the created team invitation into the organization's teamInvitations array
        organization.teamInvitations.push(teamInvite._id);

        // Save the organization after modifying it
        await organization.save();

        return teamInvite._id;
    } catch (error) {
        console.error(`Error saving team invitation to database: ${error.message}`);
        throw error;
    }
}
