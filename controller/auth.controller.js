import Helper from '../helpers/helpers.js'
import { signToken, verifyToken } from '../middlewares/jwt.js'
import User from '../models/user.model.js'
import { createResource, getResourceByField, getSingleResourceAndPopulateFields } from '../repos/db.js'
import BaseController from './base.controller.js'

const helper = new Helper()

export default class AuthController extends BaseController {
    constructor(model) {
        super(model)
    }

    async logUserIn(req, res, next) {
        /* Login
            1. Take email and password
            2. Check if email exists then check if password is correct
            3. Sign a JWT token and return that to the user
        */
        try {
            const user = await getResourceByField(User, { field: 'email', value: req.body.email })
            // check password
            if (!user.resource) {
                throw new Error('User not found')
            } else if (user.resource.password !== req.body.password) {
                throw new Error("Email or Password incorrect")
            }

            const userToken = signToken({ email: user.resource.email, role: user.resource.role, userId: user.resource.id })
            res.status(200).json({ message: 'Logged in successfully', data: { token: userToken } })
        } catch (error) {
            res.status(401).json({ message: 'Could not log user in', error: error.message })
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const userID = req.user.userId

            if (!userID) throw Error('You need to login')

            const user = await getSingleResourceAndPopulateFields(User, { id: userID }, ['organizations'])

            console.log({ user })

            if (!user.success) throw Error('Error populating user ' + user.error)

            helper.sendServerSuccessResponse(res, 200, user.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error fetching user informations')
        }
    }

    async registerUser(req, res, next) {
        /* Register
            1. Take all info needed from the form. Fullname, email,
            2. Check if email exists
            3. Then store the user's info to db
            4. Send a confirmation mail to user to verify email
        */

        try {
            const userDetails = req.body
            const newUser = await createResource(User, userDetails)

            if (newUser.error) {
                throw new Error(newUser.error);
            }

            const userToken = signToken({ email: newUser.resource.email, role: newUser.resource.role, newUserId: newUser.resource.id })

            res.status(201).json({ message: 'New user created successfully', data: { token: userToken } })
        } catch (error) {
            res.status(401).json({ message: 'Could not create new user', error: error.message })
        }
    }

    async resetPassword(req, res, next) {
        /* Reset password
            1. Take all info needed from the form. Fullname, email,
            2. Check if email exists
            3. Then store the user's info to db
        */
        // const newToken = signToken({ user: 'chinedu@gmail.com', role: "user", userId: '018501810SNFE' })

        // console.log({ newToken })
        // const payload = verifyToken(newToken)
        // res.json({ newToken, payload })
    }

    async confirmPasswordChange(req, res, next) {
        // force a password change
    }

    async verifyEmail(req, res, next) {
        // verify the user's email is correct
    }

}
