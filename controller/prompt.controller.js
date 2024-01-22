import PromptFolder from "../models/promptFolder.model.js"
import Prompt from "../models/prompt.model.js"
import Helper from "../helpers/helpers.js"
import BaseController from "./base.controller.js"
import PromptService from "../services/entities/prompt.service.js"

const helper = new Helper()
const promptService = new PromptService()

export default class PromptController extends BaseController {
    constructor(model) {
        super(model)
    }

    async createPromptFolder(req, res, next) {
        try {
            const { name } = req.body
            const userId = req.user.userId
            // console.log({ req: req.user.userId })

            const newPromptFolder = await promptService.createPromptFolder(name, userId)

            helper.sendServerSuccessResponse(res, 200, { name, userId, newPromptFolder }, 'Prompt folder created')
        } catch (error) {
            helper.sendServerErrorResponse(res, 500, error, 'Error creating prompt folder')
        }
    }

    async createPrompt(req, res, next) {
        try {
            const { content, promptFolderId } = req.body
            const userId = req.user.userId
            const createdPrompt = await promptService.createPrompt(content, userId, promptFolderId)
            helper.sendServerSuccessResponse(res, 200, { createdPrompt }, 'Prompt created')
        } catch (error) {
            helper.sendServerErrorResponse(res, 500, error, 'Error creating prompt')
        }
    }


    async getSinglePromtpFolder(req, res, next) {
        try {
            // get this folder from the db
        } catch (error) {
            // send error response
        }
    }

    async updatedPromptFolder(req, res, next) {
        try {
            // update this folder in the db
        } catch (error) {
            // send error response
        }
    }

    async deletePromptFolder(req, res, next) {
        try {
            const { id } = req.params
            // delete this folder from the db
            helper.sendServerSuccessResponse(res, 200, { id }, 'Prompt folder deleted')
        } catch (error) {
            helper.sendServerErrorResponse(res, 500, error, 'Error deleting prompt folder')
        }
    }

}
