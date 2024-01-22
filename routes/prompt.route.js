import PromptController from "../controller/prompt.controller.js";
import { Router } from 'express'
import Prompt from "../models/prompt.model.js"
import { verifyUserAction } from "../middlewares/jwt.js";

const promptController = new PromptController(Prompt)
const router = Router()

router
    .post("/", verifyUserAction, promptController.createPromptFolder)
    .get("/:id", verifyUserAction, promptController.getSinglePromtpFolder)
    .patch("/:id", verifyUserAction, promptController.updatedPromptFolder)
    .delete("/:id", verifyUserAction, promptController.deletePromptFolder)

export default router
