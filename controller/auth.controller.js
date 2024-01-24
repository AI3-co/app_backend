import Helper from '../helpers/helpers.js'
import { signToken } from '../middlewares/jwt.js'
import { EmailClient } from '@azure/communication-email'
import Team from "../models/team.model.js"
import User from '../models/user.model.js'
import Organization from "../models/organization.model.js"
import { createResource, getResourceByField, getResourceById, getSingleResourceAndPopulateFields } from '../repos/db.js'
import BaseController from './base.controller.js'
import { MICROSOFT_AUTH_ACTIONS, USER_AUTH_TYPES } from '../helpers/enum.js'

const helper = new Helper()

export default class AuthController extends BaseController {
    constructor(model) {
        super(model)
    }

    async checkIfUserExists(req, res, next) {
        let userExists = false
        let authType = req.body.type
        let responseMessage = ''
        const email = req.body.email
        let queryField
        try {
            if (authType === USER_AUTH_TYPES.EMAIL) {
                // search for this user based on the type
                queryField = USER_AUTH_TYPES.EMAIL
            }

            if (authType === USER_AUTH_TYPES.GOOGLE) {
                //
                queryField = USER_AUTH_TYPES.GOOGLE + "Email"
            }

            if (authType === USER_AUTH_TYPES.MICROSOFT) {
                //
                queryField = USER_AUTH_TYPES.MICROSOFT + "Email"
            }

            const foundUser = await getResourceByField(User, { field: queryField, value: email })

            console.log({ foundUser, queryField, email })

            if (foundUser.resource && foundUser.resource[queryField] === email) {
                userExists = true
                responseMessage = 'User exists'
            } else {
                responseMessage = 'User does not exist'
            }

            helper.sendServerSuccessResponse(res, 200, { userExists }, responseMessage)
        } catch (error) {
            helper.sendServerErrorResponse(res, 500, error, 'Error checking if user exists')
        }
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
            console.log({body: Object.keys(req.body)})
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

            if (!user.success) throw Error('Error populating user ' + user.error)

            // populate user teams
            const selectedOrganization = await getResourceById(Organization, { id: user.resource.selectedOrganization })
            // if (!selectedOrganization.success) throw Error('Could not find selected organization')
            selectedOrganization.resource && await selectedOrganization.resource.populate('teams')

            console.log({ "auth_select_org": selectedOrganization })

            if (selectedOrganization.resource)
                user.resource.selectedOrganization = selectedOrganization.resource
            else
                user.resource.selectedOrganization = null
            console.log({ "user_resource": user.resource })
            helper.sendServerSuccessResponse(res, 200, user.resource)
        } catch (error) {
            console.log(error)
            helper.sendServerErrorResponse(res, 500, error, 'Error fetching user informations')
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

            console.log({ userDetails})

            // consy 
            
            const newUser = await createResource(User, userDetails)

            if (newUser.error) {
                throw new Error(newUser.error);
            }
            const userToken = signToken({ email: newUser.resource.email, role: newUser.resource.role, userId: newUser.resource.id })
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

    async handleGoogleAccountCreation(req, res) {
        try {
            const {firstName, lastName, email, password} = req.body

            const newUser = {
                firstName,
                lastName: lastName ?? "N/A",
                googlePassword: password,
                googleEmail: email,
                email: "null@" + email,
                password: "null",
            }

            console.log({ newUser })

            const savedUser = await createResource(User, newUser)

            console.log({ savedUser })
            
            if (savedUser.error) {
                throw new Error(savedUser.error)
            }

           const userToken = signToken({ email: savedUser.resource.email, role: savedUser.resource.role, userId: savedUser.resource.id })

            helper.sendServerSuccessResponse(res, 200, { newUser: savedUser.resource, token: userToken }, 'Gooogle Login')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, error.error)
        }
    }

    async handleGoogleAccountSignIn(req, res) {
        try {
            const { googleEmail, googlePassword, ...rest } = req.body
            console.log({ googleEmail, googlePassword, rest })
        } catch (error) {
            const user = await getResourceByField(User, { field: 'googleEmail', value: googleEmail })
            console.log({ user })
            if (!user.resource) {
                throw new Error('User Not Found')
            }
            const userObj = {
                userId: user.resource.id,
                email: user.resource.googleEmail,
                role: user.resource.role
            }
            console.log({ userObj })
            const userToken = signToken(userObj)
            helper.sendServerSuccessResponse(res, 200, { user: userObj, token: userToken }, 'Logged in successfully')
        }
    }
    
    async handleMicrosoftAccountCreation(req, res) {
        try {
            // console.log({ req })
            const { firstName, lastName, email, password } = req.body
            const newUser = {
                firstName,
                lastName: lastName ?? "N/A",
                microsoftPassword: password,
                microsoftEmail: email,
                email: "null@" + email,
                password: "null",
            }

            console.log({ newUser })

            const savedUser = await createResource(User, newUser)

            console.log({ savedUser })
            
            if (savedUser.error) {
                throw new Error(savedUser.error)
            }

           const userToken = signToken({ email: savedUser.resource.email, role: savedUser.resource.role, userId: savedUser.resource.id })

            helper.sendServerSuccessResponse(res, 200, { newUser: savedUser.resource, token: userToken }, 'Microsoft Login')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, error.error)
        }
    }

    async handleMicrosoftAccountSignIn(req, res) {
        try {
            // check if user with email exists
            // check if the token sent over request is the same as what is stored, if it is return the approapriate action (authenticate, re-authenticate)
            // console.log({ req })
            let userAction;

            const { microsoftEmail, microsoftPassword, ...rest } = req.body

            console.log({ microsoftEmail, microsoftPassword, rest })

            const user = await getResourceByField(User, { field: 'microsoftEmail', value: microsoftEmail })

            console.log({ user })

            if (!user.resource) {
                throw new Error('User Not Found')
            }

            const userObj = {
                userId: user.resource.id,
                email: user.resource.microsoftEmail,
                role: user.resource.role
            }
            console.log({ userObj })

            const userToken = signToken(userObj)
            helper.sendServerSuccessResponse(res, 200, { user: userObj, token: userToken }, 'Logged in successfully')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, error.error)
        }
    }
}
