import Organization from "../models/organization.model.js"
import Team from "../models/team.model.js"
import Assistant from "../models/assistant.model.js"
import User from "../models/user.model.js"
import { createResource, getAllResourceAndPopulateRefFields, getAllResources, getManyResourcesByField, getResourceByField, getResourceById, getSingleResourceAndPopulateFields, pushUpdatesToResource, updateResource } from "../repos/db.js"
import { DefaultFolderTemplates } from "../utils/template.js"
import { buildAssistant } from "../services/openAI.service.js"
import Helper from "../helpers/helpers.js"
import { useFetchOrganizationTeams, useJoinOrganization } from "../services/entities/organization.js"

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
                            name: template.assistantName,
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
                await updateResource(User, { id: req.user.userId }, { selectedOrganization: newOrgID }) // makes the newly created organization the selected organization
                // return { _assistants, _createdAssistants, _teams, newOrganization: newOrganization.resource }
                return { newOrganization: newOrganization.resource }
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
            if (!foundOrganization.resource) throw Error('No organization found')
            helper.sendServerResponse(res, 200, { message: 'Found an organization', data: foundOrganization })
        } catch (error) {
            helper.sendServerResponse(res, 401, { message: 'Could not find this organization', error: error.message })
        }
    }

    async getOrganizationTeams(req, res) {
        try {
            const organizationID = req.params.id
            if (!organizationID) throw Error('Organization is required')
            const orgTeams = (await useFetchOrganizationTeams(organizationID)).map(organization => organization)

            helper.sendServerSuccessResponse(res, 200, orgTeams, 'Fetched teams within organization')
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error loading teams within organization')
        }
    }

    async joinOrganization(req, res) {
        try {
            const userID = req.body.userID

            if (!userID) throw Error('User is required')

            const updatedOrganization = await useJoinOrganization(userID)
            helper.sendServerSuccessResponse(res, 200, updatedOrganization, 'Joined organization')
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error joining an organization')
        }
    }

    /**
     *
     */
    async userSelectOrganization(req, res, next) {
        try {
            const organizationID = req.params.id
            const userID = req.user.userId

            if (!organizationID) throw Error("Sorry, could not switch organizations")

            const foundOrganization = await updateResource(User, { id: userID }, { selectedOrganization: organizationID })

            if (!foundOrganization.success) throw Error('Could not switch organization')
            helper.sendServerSuccessResponse(res, 200, foundOrganization.resource, 'Switched organization')
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error selecting an organization')
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
