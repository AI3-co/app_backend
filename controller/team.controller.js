
import Helper from '../helpers/helpers.js';
import Team from '../models/team.model.js'
import Organization from "../models/organization.model.js"
import { getAllResources, getResourceById, getSingleResourceAndPopulateFields } from '../repos/db.js'
import { populate } from 'dotenv';
import { ObjectId } from 'mongoose';
import { getInvitationDetailsFromDatabase } from '../repos/db.js';
import { associateUserWithTeam } from '../repos/db.js';
import TeamInvite from '../models/teamInvite.model.js';
import { v4 as uuidv4 } from 'uuid';
import { signToken } from '../middlewares/jwt.js';

const helper = new Helper()

class TeamController {
    constructor() {

    }

    /**
     * When creating a team:
     * create 5 teams and 5 assistants for each team
     *
     */
    async createTeam(req, res) {
        // create one assistant for a team
        // create team
    }

    async deleteTeam() { }

    async updateTeam() { }

    async getSingleTeam(req, res) {
        try {
            let foundTeam;
            if (req.params.id)
                foundTeam = await getSingleResourceAndPopulateFields(Team, { id: req.params.id }, ['defaultAssistant', 'members', 'organization', 'assistants', 'threads'])
            // foundTeam = await getResourceById(Team, { id: req.params.id })

            if (!foundTeam.resource) throw Error('No such team found')

            res.status(200).json({ data: foundTeam })
        } catch (error) {
            res.status(400).json({ error: error.message, message: 'Error fetching single team' })
        }
    }

    async getTeamThreads(req, res, next) {
        try {
            const teamID = req.params.id
            if (!teamID) throw Error('Team is required')
            const foundTeamThreads = await getSingleResourceAndPopulateFields(Team, { id: teamID }, ['defaultAssistant'])
            if (!foundTeamThreads.success) throw Error('Could not find team thread')
            console.log({ foundTeamThreads })
            helper.sendServerSuccessResponse(res, 200, foundTeamThreads.resource, 'Fetched team threads')
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error loading team thread')
        }
    }

    /**
    * Get team details: People, Agents, Threads, Templates, etc
    * Find all agents that belong to a team
    */
    async getTeamDetails(req, res, next) {
        try {
            const teamID = req.params.id
            const resourceType = req.query.resourceType
            const resourceID = req.query.resourceID
            let currentType, populateArray;

            console.log({ resourceType, resourceID })

            if (!teamID) throw Error('Team is required')

            if (!resourceType) throw Error('Resource type is required')

            console.log({ teamID, resourceType, resourceID })

            switch (resourceType) {
                case 'agents':
                    currentType = 'assistants'
                    populateArray = [{ path: 'assistants' }]
                    break
                case 'chats':
                    currentType = 'threads'
                    populateArray = [{ path: 'threads', populate: { path: 'createdBy' } }, { path: 'threads' }]
                    break
                case 'templates':
                    currentType = 'promptFolder'
                    populateArray = [{ path: 'promptFolder' }]
                    break
                case 'people':
                    currentType = 'members'
                    populateArray = [{ path: 'members' }]
                    break
                case 'files':
                    currentType = 'files'
                    populateArray = [{ path: 'files' }]
                default:
                    throw Error(resourceType + ' is not a valid resource type')
            }

            const foundTeam = await getSingleResourceAndPopulateFields(Team, { id: teamID }, [...populateArray])

            console.log({ newFoundTeam: foundTeam })

            console.log({ currentType, populateObj: populateArray })

            // const foundTeamResource = await
            helper.sendServerSuccessResponse(res, 200, foundTeam.resource[currentType], 'Fetched team details')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, error.message)
        }
    }

    async getAllTeams(req, res) {
        try {
            const foundTeams = await getAllResources(Team)
            helper.sendServerSuccessResponse(res, 200, foundTeams.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error fetching all teams')
        }
    }

    async sendTeamInvitation(req, res) {
        const { organizationID, email, accessLevel } = req.body;
      
        const jwtPayload = {
            organizationID,
            email,
            accessLevel,
        }; 

        const invitationToken = signToken(jwtPayload);
      
        const teamInvite = new TeamInvite({
          organizationID,
          email,
          accessLevel,
          token: invitationToken,
          expirationDate: Date.now() + 24*60*60*1000, // 24 hours from now
        });
      
        await teamInvite.save();
      
        // Send the invitationToken to the user by email or other means
      
        res.json({
          message: 'Team invitation sent successfully.',
            invitationToken,
        });
      } catch (error) {
        res.status(400).json({ error: error.message, message: 'Error sending team invitation.' });
        }
    

    async acceptTeamInvitation(req, res) {
        try {
            const invitationToken = req.body.invitationToken;
        
            // Perform validation and checks as needed
            if (!invitationToken) {
                throw new Error('Invalid request parameters.');
            }
            // Logic to accept team invitations
            const invitationDetails = await getInvitationDetailsFromDatabase(invitationToken);
            await associateUserWithTeam(invitationDetails.organizationID, invitationDetails.email, invitationDetails.invitedUserID, invitationDetails.accessLevel);
        
            // Respond with success or error message
            res.status(200).json({ message: 'Team invitation accepted successfully.' });
        } catch (error) {
            // Respond with error message
            res.status(400).json({ error: error.message, message: 'Error accepting team invitation.' });
        }
    }

    async updateMemberPermissions(req, res) {
        try {
            const organizationID = req.params.organizationId;
            const userID = req.params.userId;
            const newAccessLevel = req.body.accessLevel;

            // Perform validation and checks as needed
            if (!organizationID || !userID || !newAccessLevel) {
                throw new Error('Invalid request parameters.');
            }

            // Logic to update member permissions
            await updateMemberAccessLevel(organizationID, userID, newAccessLevel);

            // Respond with success or error message
            res.status(200).json({ message: 'Member permissions updated successfully.' });
        } catch (error) {
            // Respond with error message
            res.status(400).json({ error: error.message, message: 'Error updating member permissions.' });
        }
    }

}

// Function to save invitation to the database
export async function saveInvitationToDatabase(organizationID, invitedUserID) {
    try {
        // Validate that organizationID is a valid ObjectId
        if (!ObjectId.isValid(organizationID)) {
            throw new Error('Invalid organization ID.');
        }

        // Logic to save the invitation to the database
        const organization = await Organization.findById(organizationID);

        if (!organization) {
            return { error: 'Invalid organization ID.', success: false };
        }

        // Assuming 'teamInvitations' is an array in your Organization model
        organization.teamInvitations.push(
            invitedUserID,
            // Add other necessary details
        );

        await organization.save();

        // Return the invitation token or any other relevant data
        return { invitationToken: 'your_invitation_token', success: true };
    } catch (error) {
        return { error: `Error saving team invitation to database: ${error.message}`, success: false };
    }
}


export default TeamController;

