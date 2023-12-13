import TeamController from "../controller/team.controller.js";
import { Router } from "express"

const router = Router()
const tC = new TeamController()

router
    .get("/", tC.getAllTeams)
    .get("/:id", tC.getSingleTeam)

export default router
