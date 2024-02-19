import UserController from "../controller/user.controller.js";
import { verifyUserAction } from "../middlewares/jwt.js";
import User from "../models/user.model.js"
import { Router } from 'express'

const {
    getAllUsers,
    getSingleUser,
    deleteSinglesUser,
    updateSingleUser,
    createUser
} = new UserController(User)
const router = Router()

router.get('/', getAllUsers)
router.get('/:id', getSingleUser)
router.post('/', createUser)
router.patch('/update', verifyUserAction, updateSingleUser)
router.delete('/:id', deleteSinglesUser)

export default router

