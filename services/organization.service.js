import Organization from "../models/organization.model.js"

export default class OrganizationService {
    async editOrganizationInfo(organizationID, newInfo) {
        try {
            // find organization and update data within in
            const updatedOrganization = await Organization.findByIdAndUpdate(organizationID, { ...newInfo }, { new: true })
            // return newly edited version of the organization
            return updatedOrganization
        } catch (error) {
            console.log({ error: Object.keys(error) })
            throw Error(error)
        }
    }
}

