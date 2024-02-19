import { createResource, getResourceById, getAllResources, getAllResourceAndPopulateRefFields } from "../repos/db.js";
import BaseController from "./base.controller.js";
import User from "../models/user.model.js"
import Helper from "../helpers/helpers.js";
import UserService from "../services/user.service.js";

const helper = new Helper()
const userService = new UserService()
class UserController extends BaseController {
    constructor(model) {
        super(model)
    }

    async createUser(req, res, next) {
        const user = { ...req.body }
        const newUser = await createResource(User, user)

        if (newUser.success) {
            res.status(201).json({ message: "User created successfully", data: newUser.resource })
        } else {
            console.log("User not created")
            res.status(401).json({ data: newUser.error })
        }
    }

    async getAllUsers(req, res, next) {
        // get all users
        try {
            const allUsers = await getAllResourceAndPopulateRefFields(User, ['teams', 'organizations'])
            // console.log({ allUsers })
            res.status(200).json({ data: allUsers, message: "All users fetched" })
        } catch (error) {
            res.status(401).json({ error: 'Error Fetching all users', message: error.message })
        }
    }

    async getSingleUser(req, res) {
        try {
            const user = await getResourceById(User, { id: req.params.id })
            console.log({ singleUser: user, id: req.params.id })
            if (!user.resource) throw new Error("User not found")
            helper.sendSuccessResponse(res, 200, user, "User found")
        } catch (error) {
            helper.sendServerErrorResponse(res, 404, error.message)
        }
    }

    async updateSingleUser(req, res) {
        // update a single user
        try {
            console.log({ req: req.user })
            const editedUser = await userService.editUserInfo(req.user.userId, req.body)
            console.log({ editedUser })
            helper.sendServerSuccessResponse(res, 200, editedUser, 'User updated')
        } catch (error) {
            helper.sendServerErrorResponse(res, 404, error.message)
        }
    }

    async deleteSinglesUser(req, res, next) {
        // delete a single user
    }
}

export default UserController
