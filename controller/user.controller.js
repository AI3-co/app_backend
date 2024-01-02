import { createResource, getResourceById, getAllResources, getAllResourceAndPopulateRefFields } from "../repos/db.js";
import BaseController from "./base.controller.js";
import User from "../models/user.model.js"

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

    async getSingleUser(req, res, next) {
        // fetch a single user
        // const data = await getResources(req, res, next, { model: User, message: "User found" })
        // console.log('Data', data)
    }

    async updateSingleUser(req, res, next) {
        // update a single user
    }

    async deleteSinglesUser(req, res, next) {
        // delete a single user
    }
}

export default UserController
