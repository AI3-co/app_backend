
import Helper from '../helpers/helpers.js';
import Team from '../models/team.model.js'
import Organization from "../models/organization.model.js"
import { getAllResources, getResourceById, getSingleResourceAndPopulateFields } from '../repos/db.js'
import { populate } from 'dotenv';

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

            // I want to write code that would extract the resource type and resource ID from the URL

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

            console.log({ foundTeam })

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
}

export default TeamController
