import { Router } from 'express'
import Helper from '../helpers/helpers.js'
import MessageController from '../controller/message.controller.js'

const router = Router()
const mC = new MessageController()

router
    .get("/:id", mC.getSingleMessage)
    .get("/", mC.getAllMessages)

export default router
