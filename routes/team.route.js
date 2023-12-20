import TeamController from "../controller/team.controller.js";
import { Router } from "express"

const router = Router()
const tC = new TeamController()

router
    .get("/:id", tC.getSingleTeam)
    .get("/:id/threads", tC.getTeamThreads)
    .get("/", tC.getAllTeams)
    .post("/", tC.createTeam)

export default router
