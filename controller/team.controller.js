
import Team from '../models/team.model.js'
import { getResourceById } from '../repos/db.js'

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
                foundTeam = await getResourceById(Team, { id: req.params.id })
            res.status(200).json({ data: foundTeam })
        } catch (error) {
            res.status(400).json({ error: error.message, message: 'Error fetching single team' })
        }
    }

    async getAllTeams(req, res) {
        res.send("Got all teams")
    }
}

export default TeamController
