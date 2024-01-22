import Helper from "../helpers/helpers";
import PromptFolderService from "../services/entities/promptFolder.service";

const helper = new Helper()
const promptFolderService = new PromptFolderService()

export default class PromptFolderController {
    async createPromptFolder(req, res, next) {
        const { name, createdBy } = req.body

        if (!name) {
            helper.sendServerErrorResponse(res, 400, "Prompt folder name is required")
        }

        if (!createdBy) {
            helper.sendServerErrorResponse(res, 400, "User is required")
        }

        const createdFolder = await promptFolderService.createPromptFolder(name, createdBy)

        if (createdFolder) {
            helper.sendServerSuccessResponse(res, 200, { createdFolder }, "Created prompt folder")
        } else {
            helper.sendServerErrorResponse(res, 400, "Error creating prompt folder")
        }
    }

    async getSinglePromtpFolder(req, res, next) { }

    async deletePromptFolder(req, res, next) { }

    async updatedPromptFolder(req, res, next) { }

    async getAllPromptFolders(req, res, next) { }
}

