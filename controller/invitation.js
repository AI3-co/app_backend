import Organization from '../models/organization.model.js';
import TeamInvite from '../models/teamInvite.model.js';



// Updated function to include email and organizationID
export async function saveTeamInvitationToDatabase(organizationID, invitedUserID, accessLevel, email) {
    try {
        // Logic to save team invitation to the database
        const organization = await Organization.findById(organizationID);
        if (!organization) {
            throw new Error(`Organization with ID ${organizationID} not found`);
        }

        // Use a resource method to create a new team invitation
        const teamInvite = await TeamInvite.createTeamInvite({
            invitedUserID,
            accessLevel,
            email, // Include email
            organizationID, // Include organizationID
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

        



        

        // create team invite - resource method - access the properities 
        // creates record - returns the id of the record
        // pull the id of invite
        // put the id in and push

        // Add the invitation to the organization's teamInvitations array
       // organization.teamInvitations.push({
        //    invitedUserID,
          //  accessLevel,
       /*     token: generateUniqueToken(), // You can use any token generation library of your choice */
       // Add the ID of the Token "Normalization" - create records in the database
          //  status: 'pending',
        // });

        // Don't forget to save the organization after modifying it
       /* await organization.save();

        } catch (error) {
        console.error(`Error saving team invitation to database: ${error.message}`);
        } 
} */
