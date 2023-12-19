import Organization from "../models/organization.model.js"
import Team from "../models/team.model.js"
import Assistant from "../models/assistant.model.js"
import User from "../models/user.model.js"
import { createResource, getAllResourceAndPopulateRefFields, getAllResources, getResourceById, getSingleResourceAndPopulateFields, pushUpdatesToResource, updateResource } from "../repos/db.js"
import { DefaultFolderTemplates } from "../utils/template.js"
import { buildAssistant } from "../services/openAI.service.js"
import Helper from "../helpers/helpers.js"

const helper = new Helper()

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

            const userToken = req.headers.authorization
            const newOrganizationName = req.body.name

            if (!userToken) {
                throw new Error("Only a user can create orgnizations")
            }

            if (!req.user) {
                throw new Error("Log in as a user to create an organization")
            }

            if (!newOrganizationName)
                throw new Error("Your Organization needs a name ")

            const orgData = {
                name: newOrganizationName,
                members: [req?.user?.userId],
                owner: req?.user?.userId  /// extracted id of user
            }
            const newOrganization = await createResource(Organization, orgData)
            const newOrgID = newOrganization.resource._id.toString()

            // console.log({ orgData, newOrgID })

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
                            createdBy: req?.user?.userId
                        }

                        const newTeam = await createResource(Team, _team)
                        _teams.push(newTeam.resource)

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
                        await pushUpdatesToResource(Team, { id: newTeam.resource._id.toString() }, { fieldToUpdate: 'assistants', newData: [newAssistant.resource.id] })
                        // use the first assistant as Team's default assistant
                        await updateResource(Team, { id: newTeam.resource._id.toString() }, { defaultAssistant: newAssistant.resource.id })
                        _createdAssistants.push(newAssistant.resource)
                        _assistants.push(builtAssistant.createdAssistant)
                    })
                )
                const teamIDs = _teams.map(team => team.id.toString())
                await pushUpdatesToResource(Organization, { id: newOrgID }, { fieldToUpdate: 'teams', newData: teamIDs })
                await pushUpdatesToResource(User, { id: req.user.userId }, { fieldToUpdate: 'organizations', newData: [newOrgID] })
                await pushUpdatesToResource(User, { id: req.user.userId }, { fieldToUpdate: 'teams', newData: teamIDs })
                return { _assistants, _createdAssistants, _teams, newOrganization: newOrganization.resource }
            }

            const createdGroup = newOrganization.success && await createOrganizationGroup()
            // console.log({ createdGroup })
            res.status(201).json({ message: "Organization created", createdGroup })

        } catch (error) {
            res.status(401).json({ message: 'Could not create organization', error: error.message })
        }
    }


    /**
     * Get One Organization
     */
    async getSingleOrganization(req, res, next) {
        try {
            const organizationID = req.params.id
            const foundOrganization = await getSingleResourceAndPopulateFields(Organization, { id: organizationID }, ['members', 'owner', 'teams'])
            helper.sendServerResponse(res, 200, { message: 'Found an organization', data: foundOrganization })
        } catch (error) {
            helper.sendServerResponse(res, 401, { message: 'Could not find this organization', error: error.message })
        }
    }

    /* EDIT AN ORGANIZATION */
    /*
    */


    /* GET ALL ORGANIZATIONS */
    /**
     *
    */
    async getAllOrganizations(req, res, next) {
        try {
            // DefaultFolderTemplates
            const populatedOrganizations = await getAllResourceAndPopulateRefFields(Organization, ['members', 'owner', 'teams'])

            if (!populatedOrganizations.success) throw new Error(populatedOrganizations.error)

            console.log({ user: req.user })
            res.status(200).json({ message: 'Fetched all organizations', data: populatedOrganizations })
        } catch (error) {
            res.status(401).json({ message: 'Could not create organization', error: error.message })
        }
    }
}

export default OrganizationController
