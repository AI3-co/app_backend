
import Helper from '../helpers/helpers.js';
import Team from '../models/team.model.js'
import { getAllResources, getResourceById, getSingleResourceAndPopulateFields } from '../repos/db.js'

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
                // foundTeam = await getSingleResourceAndPopulateFields(Team, { id: req.params.id }, ['defaultAssistant', 'members', 'organization'])
                foundTeam = await getResourceById(Team, { id: req.params.id })

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
