import AssistantController from "../controller/assistant.controller.js";
import { verifyUserAction } from "../middlewares/jwt.js";
import Assistant from '../models/assistant.model.js'
import { Router } from 'express'

const assistantController = new AssistantController(Assistant)
const router = Router()

router
    .post("/", verifyUserAction, assistantController.createAssistant)
    .get("/", verifyUserAction, assistantController.getAllAssistants)
    .get("/:id", verifyUserAction, assistantController.getSingleAssistant)
    .put("/:id/edit", verifyUserAction, assistantController.updateAssistant)
    .get("/team/:id", verifyUserAction, assistantController.getTeamAssistants)
    .post("/create/team", verifyUserAction, assistantController.createAssistantUnderTeam)

export default router
