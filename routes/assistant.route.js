import AssistantController from "../controller/assistant.controller.js";
import Assistant from '../models/assistant.model.js'
import { Router } from 'express'

const assistantController = new AssistantController(Assistant)
const router = Router()

router
    .post("/", assistantController.createAssistant)
    .get("/:id", assistantController.getAssistant)

export default router
