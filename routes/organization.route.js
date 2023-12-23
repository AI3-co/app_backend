import { Router } from 'express'
import OrganizationController from '../controller/organization.controller.js'
import { verifyUserAction } from '../middlewares/jwt.js'

const organizationController = new OrganizationController()

const router = Router()

router
    .patch("/select/:id", verifyUserAction, organizationController.userSelectOrganization)
    .get("/", verifyUserAction, organizationController.getAllOrganizations)
    .get("/:id/teams", verifyUserAction, organizationController.getOrganizationTeams)
    .post("/", verifyUserAction, organizationController.createOrganization)
    .get("/:id", verifyUserAction, organizationController.getSingleOrganization)
// .get("")

export default router
