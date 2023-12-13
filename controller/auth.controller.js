import User from '../models/user.model.js'
import BaseController from './base.controller.js'

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
        res.send('Log in user')
    }

    async registerUser(req, res, next) {
        /* Register
            1. Take all info needed from the form. Fullname, email,
            2. Check if email exists
            3. Then store the user's info to db
            4. Send a confirmation mail to user to verify email
        */
    }

    async resetPassword(req, res, next) {
        /* Reset password
            1. Take all info needed from the form. Fullname, email,
            2. Check if email exists
            3. Then store the user's info to db
        */
    }

    async confirmPasswordChange(req, res, next) {
        // force a password change
    }

    async verifyEmail(req, res, next) {
        // verify the user's email is correct
    }

}
