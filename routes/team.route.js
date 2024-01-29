import TeamController from "../controller/team.controller.js";
import { Router } from "express"
import { saveTeamInvitationToDatabase } from "../controller/invitation.js"

const router = Router()
const tC = new TeamController()

router
    .get("/:id", tC.getSingleTeam)
    .get("/:id/details", tC.getTeamDetails)
    .get("/:id/threads", tC.getTeamThreads)
    .get("/", tC.getAllTeams)
    .post("/", tC.createTeam)
    .post("/:id/invite", tC.sendTeamInvitation)
    .post("/:id/invite/", saveTeamInvitationToDatabase)
    .post("/:id/invite/accept", tC.acceptTeamInvitation)
   /* .post("/:id/invite/", async (req, res) => {
        try {
            const { organizationID, invitedUserID, accessLevel } = req.body;
            const result = await saveTeamInvitationToDatabase(organizationID, invitedUserID, accessLevel);
            res.status(200).json({ message: "Confirmed invite", result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }); */

    

export default router