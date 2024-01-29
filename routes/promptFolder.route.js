import PromptController from "../controller/prompt.controller.js";
import { Router } from 'express'
import Prompt from "../models/prompt.model.js"
import { verifyUserAction } from "../middlewares/jwt.js";

const promptFolderController = new PromptController(Prompt)
const router = Router()

router
    .post("/", verifyUserAction, promptFolderController.createPromptFolder)
    .get("/:id", verifyUserAction, promptFolderController.getSinglePromtpFolder)
    .patch("/:id", verifyUserAction, promptFolderController.updatedPromptFolder)
    .delete("/:id", verifyUserAction, promptFolderController.deletePromptFolder)

export default router
