import { Router } from "express"
import ThreadController from "../controller/thread.controller.js"
import { verifyUserAction } from "../middlewares/jwt.js"

const router = Router()
const threadController = new ThreadController()

router
    .get("/", verifyUserAction, threadController.getAllThreads)
    .patch("/:id", verifyUserAction, threadController.updateThreadWithMessage)
    .get("/messages/:id", verifyUserAction, threadController.getAllMessagesWithinThread)
    .post("/", verifyUserAction, threadController.createThread)
    .get("/:id", verifyUserAction, threadController.getSingleThread)
    .delete("/:id", verifyUserAction, threadController.deleteThread)

export default router
