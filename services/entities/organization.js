import Organization from "../../models/organization.model.js"
import Team from "../../models/team.model.js"
import { getResourceById, updateResource } from "../../repos/db.js"

export async function useJoinOrganization(organizationID, userID) {
    try {
        if (!organizationID) throw Error('Organization needed')
        const foundOrg = await updateResource(Organization, { id: organizationID }, { members: userID })

        if (!foundOrg.success) throw Error('Could not join organization')

        return foundOrg
    } catch (error) {
        throw Error('Error adding user to Organization ')
    }
}


export async function useFetchOrganizationTeams(organizationID) {
    try {
        if (!organizationID) throw Error('Organization needed')
        // const foundOrg = await updateResource(Organization, { id: organizationID })
        const organization = await Organization
                                    .findById(organizationID)
                                    .populate('teams')
                                    .populate('members')
        return organization
    } catch (error) {
        throw Error('Error adding user to Organization: ' + error.message)
    }  
}


// export async function useRemoveUserFromOrganization (){
//     try {

//     } catch (error) {

//     }
// }
