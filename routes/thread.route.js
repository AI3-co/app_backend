import { Router } from "express"
import ThreadController from "../controller/thread.controller.js"
import { verifyUserAction } from "../middlewares/jwt.js"

const router = Router()
const threadController = new ThreadController()

router
    .patch("/:id", verifyUserAction, threadController.updateThreadWithMessage)
    .get("/messages/update/:id", verifyUserAction, threadController.getAllMessagesWithinThread)
    .get("/messages/load/:thread-:team", verifyUserAction, threadController.loadThreadMessages)
    .get("/:id", verifyUserAction, threadController.getSingleThread)
    .delete("/:id", verifyUserAction, threadController.deleteThread)
    .post("/", verifyUserAction, threadController.createThread)
    .get("/", verifyUserAction, threadController.getAllThreads)

export default router
