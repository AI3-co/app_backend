import { createResource, getResourceById } from "../repos/db.js";
import BaseController from "./base.controller.js";
import User from "../models/user.model.js"

class UserController extends BaseController {
    constructor(model) {
        super(model)
    }

    async createUser(req, res, next) {
        const user = { ...req.body }
        const newUser = await createResource(User, user)
        console.log('New User: ', newUser)

        if (newUser.success) {
            console.log("User created")
            res.status(201).json({ data: newUser.resource })
        } else {
            console.log("User not created")
            res.status(401).json({ data: newUser })
        }
    }

    async getAllUsers(req, res, next) {
        // get all users
    }

    async getSingleUser(req, res, next) {
        // fetch a single user
        // const data = await getResources(req, res, next, { model: User, message: "User found" })
        console.log('Data', data)
    }

    async updateSingleUser(req, res, next) {
        // update a single user
    }

    async deleteSinglesUser(req, res, next) {
        // delete a single user
    }
}

export default UserController
