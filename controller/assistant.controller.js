import Helper from '../helpers/helpers.js';
import Assistant from '../models/assistant.model.js'
import { createResource, getSingleResourceAndPopulateFields } from '../repos/db.js';
import AssistantService from '../services/assistants.js';
import { buildAssistant } from '../services/openAI.service.js';

const helper = new Helper()
const assistantService = new AssistantService()

class AssistantController {

    async getAllAssistants(req, res) {
        const assistants = await assistantService.getAllAssistants()

        console.log({ assistants })

        helper.sendServerSuccessResponse(res, 200, assistants, 'Found all assistants')
    }

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

    async createAssistantUnderTeam(req, res) {
        try {
            const { teamID, ...data } = req.body
            console.log({ tID: teamID, data })
            const newAssistant = await assistantService.newAssistant(teamID, data)
            console.log({ newASS: newAssistant })
            helper.sendServerSuccessResponse(res, 201, newAssistant, 'Assistant created and assigned')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, error.error)
        }
    }

    async getSingleAssistant(req, res, next) {
        try {
            const assistantID = req.params.id
            if (!assistantID) throw Error('You need an assistant')
            const foundAssistant = await getSingleResourceAndPopulateFields(Assistant, { id: assistantID })
            console.log({ foundAssistant })
            if (!foundAssistant.success || !foundAssistant.resource) throw Error('Could not find assistant')

            helper.sendServerSuccessResponse(res, 200, foundAssistant.resource, 'Found assistant')
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, 'Error finding assistant')
        }
    }

    async updateAssistant(req, res) {
        const { id, ...formData } = req.body

        console.log({ id, formData })
        const editedAssistant = await assistantService.editAssistant(id, formData)

        helper.sendServerSuccessResponse(res, 200, editedAssistant, 'Assistant updated')
    }

    async createAssistantOnServer(templates) {
        /**
         * Loop over templates
         * Create an assistant for each template and store to mongodb
         */
    }

}

export default AssistantController

