import Prompt from "../../models/prompt.model.js"
import { createResource } from "../../repos/db.js"

export default class PromptService {
    async createPrompt(content, createdBy, promptFolderId) {
        try {
            const createdPrompt = await createResource(Prompt, { content, createdBy, folder: promptFolderId })
            console.log({ createdPrompt })
            if (createdPrompt.resource) {
                return createdPrompt.resource
            }
        } catch (error) {
            throw Error('Error creating prompt(Service)')
        }
    }
}
