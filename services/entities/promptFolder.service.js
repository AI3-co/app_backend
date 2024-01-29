import { createResource } from "../../repos/db.js"
import PromptFolder from "../../models/promptFolder.model.js"

export default class PromptFolderService {
    async createPromptFolder(name, createdBy) {
        try {
            const createdFolder = await createResource(PromptFolder, { name, createdBy })
            console.log({ createdFolder })
            if (createdFolder.resource) {
                return createdFolder.resource
            }
        } catch (error) {
            throw Error('Error creating prompt folder(Service)')
        }
    }

    async getSinglePromptFolder(id) {
        try {
            const foundPromptFolder = await PromptFolder.findById(id)
            console.log({ foundPromptFolder })
            return foundPromptFolder
        } catch (error) {
            throw Error('Error getting single prompt folder(Service)')
        }
    }

    async getAllPromptFolders(id) {
        try {
            const foundPromptFolders = await PromptFolder.findById(id)
            console.log({ foundPromptFolders })
            return foundPromptFolders
        } catch (error) {
            throw Error('Error getting single prompt folder(Service)')
        }
    }

    async updatePromptFolder() { }

    async deletePromptFolder() { }
}
