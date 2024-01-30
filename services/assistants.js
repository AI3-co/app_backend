import { createResource, getAllResources, pushUpdatesToResource, updateResource } from "../repos/db.js"
import Assistant from "../models/assistant.model.js"
import { buildAssistant } from "./openAI.service.js";
import Team from "../models/team.model.js";

class AssistantService {

    async getAllAssistants() {
        try {
            const assistants = await getAllResources(Assistant)

            console.log({ assistants })

            if (!assistants.success || !assistants.resource) {
                throw Error('Could not get all assistants')
            }

            return assistants.resource

        } catch (error) {
            throw Error('Error while getting all assistants ' + error.message)
        }
    }

    async editAssistant(id, data) {
        let updatedAssistant;
        try {
            const foundAssistant = await updateResource(Assistant, { id }, data)
            console.log({ "edit_assistant": foundAssistant, data })

            if (foundAssistant.error) throw Error('Could not update resource')

            updatedAssistant = foundAssistant.resource
        } catch (error) {
            updatedAssistant = error
        } finally {
            return updatedAssistant
        }
    }

    async newAssistant(teamID, payload) {
        let result;

        try {
            const builtAssistant = await buildAssistant(payload)
            console.log({ builtAssistant })

            if (builtAssistant.success) {
                const nativeConfig = { ...payload, openaiID: builtAssistant?.createdAssistant?.id }
                const newAssistant = await createResource(Assistant, nativeConfig)
                console.log({ newAssistant })
                if (newAssistant.success) {
                    result = newAssistant.resource
                    console.log({ result })
                    const assignAssitant = await this.assignAssistantToTeam(teamID, result?.id)
                    console.log({ assignAssitant })
                    return result
                } else {
                    throw Error('Could not create assistant on DB' + newAssistant?.error)
                }

            }
        } catch (error) {
            console.log({ error: Object.keys(error) })
            throw Error(error)
        }
    }

    async assignAssistantToTeam(teamID, assistantID) {
        let foundTeam;

        try {
            foundTeam = await pushUpdatesToResource(Team, { id: teamID }, { fieldToUpdate: 'assistants', newData: [assistantID] })
            console.log({ foundTeam })
            return foundTeam
        } catch (error) {
            throw Error('Error assigning assistant to team ' + error.message)
        }
    }
}

export default AssistantService
