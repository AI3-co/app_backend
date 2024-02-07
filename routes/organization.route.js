import { Router } from 'express'
import OrganizationController from '../controller/organization.controller.js'
import { verifyUserAction } from '../middlewares/jwt.js'
import { saveTeamInvitationToDatabase } from '../controller/invitation.js'

const organizationController = new OrganizationController()

const router = Router()

router
    .patch("/select/:id", verifyUserAction, organizationController.userSelectOrganization)
    .get("/", verifyUserAction, organizationController.getAllOrganizations)
    .get("/:id/teams", verifyUserAction, organizationController.getOrganizationTeams)
    .post("/", verifyUserAction, organizationController.createOrganization)
    .get("/:id", verifyUserAction, organizationController.getSingleOrganization)
    .post("/:id/invite/accept", verifyUserAction, organizationController.acceptTeamInvitation)
    .put("/:organizationId/members/:userId", verifyUserAction, organizationController.updateMemberPermissions)
    .post("/:id/invite", saveTeamInvitationToDatabase) // Use the same function for sending team invitations

export default router