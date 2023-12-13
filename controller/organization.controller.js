import Organization from "../models/organization.model.js"
import Team from "../models/team.model.js"
import Assistant from "../models/assistant.model.js"
import { createResource, getAllResources, pushUpdatesToResource } from "../repos/db.js"
import { DefaultFolderTemplates } from "../utils/template.js"
import { buildAssistant } from "../services/useOpenai.js"

class OrganizationController {
    /* JOIN AN ORGANIZATION */
    /*
    */

    /* REMOVE FROM ORGANIZATION */
    /*
    There would be a slight difference when one leaves an organization or gets kicked out
    */

    /* DELETE AN ORGANIZATION */
    /*
    */


    /* CREATE AN ORGANIZATION */
    /**
     * On creating an organization, create 5 default teams along with their default assistants
     */
    async createOrganization(req, res, next) {
        try {
            const orgData = {
                name: req.body.name
            }
            const newOrganization = await createResource(Organization, orgData)
            const newOrgID = newOrganization.resource._id.toString()

            //console.log("ORG", { newOrganization: newOrganization.resource, id: newOrganization.resource._id.toString() })
            console.log({ orgData, newOrgID })

            // create an assistant then a team based on default Folder Templates
            async function createOrganizationGroup() {
                let _assistants = []
                let _teams = []
                let _createdAssistants = []

                await Promise.all(
                    DefaultFolderTemplates.map(async (template) => {
                        let _team = {
                            name: template.name,
                            organization: newOrgID,
                        }

                        const newTeam = await createResource(Team, _team)
                        _teams.push(newTeam.resource)
                        // create assistant
                        // name, openaiID, model, instructions, teams

                        const assistantConfig = {
                            instructions: template.instructions,
                            name: template.name,
                            model: template.model,
                            alias: template.assistantName
                        }

                        const builtAssistant = await buildAssistant(assistantConfig)

                        let _assistant = {
                            ...assistantConfig,
                            openaiID: builtAssistant.createdAssistant.id,
                            teams: [newTeam.resource._id.toString()]
                        }
                        const newAssistant = await createResource(Assistant, _assistant)
                        console.log({ newAssistant })
                        _createdAssistants.push(newAssistant.resource)
                        _assistants.push(builtAssistant.createdAssistant)
                    })
                )
                const teamIDs = _teams.map(team => team.id.toString())
                console.log('Team Ids', teamIDs)
                pushUpdatesToResource(Organization, { id: newOrgID }, { fieldToUpdate: 'teams', newData: teamIDs })

                return { _assistants, _createdAssistants, _teams, newOrganization: newOrganization.resource }
            }

            const createdGroup = newOrganization.success && await createOrganizationGroup()
            // console.log({ createdGroup })
            res.status(201).json({ message: "Organization created", createdGroup })
        } catch (error) {
            res.status(401).json({ data: 'Could not create organization', error: error.message })
        }
    }


    /**
     * Get One Organization
     */
    // async getSingleOrganization(req, res, next) {
    //     try {

    //     } catch (error) {

    //     }
    // }

    /* EDIT AN ORGANIZATION */
    /*
    */


    /* GET ALL ORGANIZATIONS */
    /**
     *
    */
    async getAllOrganizations(req, res, next) {
        try {
            //
            // console.log("ORG", { newOrganization, id: newOrganization.resource.data })
            // DefaultFolderTemplates
            const organizations = await getAllResources(Organization)

            res.status(200).json({ message: 'Fetched all organizations', data: organizations })
        } catch (error) {
            res.status(401).json({ message: 'Could not create organization', error: error.message })
        }
    }
}

export default OrganizationController
