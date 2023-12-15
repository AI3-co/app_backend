import Assistant from '../models/assistant.model.js'
import { createResource } from '../repos/db.js';
import { buildAssistant } from '../services/openAI.service.js';

class AssistantController {

    async createAssistant(req, res, next) {
        const { body } = req
        const buildConfig = {
            instructions: body.instructions,
            name: body.name,
            tools: [],
            model: body.model
        }

        const builtAssistant = await buildAssistant(buildConfig)

        if (builtAssistant.success) {
            const nativeConfig = { ...buildConfig, openaiID: builtAssistant?.createdAssistant?.id }
            const newAssistant = await createResource(Assistant, nativeConfig)
            if (newAssistant.success) {
                res.status(201).json({ data: newAssistant.resource, message: "Assistant created" })
            } else {
                res.status(401).json({ data: newAssistant, error: "Could not create Assistant" })
            }
        } else {
            res.status(401).json({ data: 'Could not create assistant' })
        }

    }

    async getAssistant(req, res, next) {
        res.send('Got all assistants')
        // const resource = { model: Assistant, message: "Assistant found" }
        // const foundAssistant = await getResources(req, res, next, resource)
        // console.log('Found Assistant', foundAssistant)
    }

    async createAssistantOnServer(templates) {
        /**
         * Loop over templates
         * Create an assistant for each template and store to mongodb
         */
    }

}

export default AssistantController

