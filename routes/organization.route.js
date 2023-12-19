import { Router } from 'express'
import OrganizationController from '../controller/organization.controller.js'
import { verifyToken, verifyUserAction } from '../middlewares/jwt.js'

const organizationController = new OrganizationController()

const router = Router()

router
    .patch("/select/:id", verifyUserAction, organizationController.userSelectOrganization)
    .get("/", verifyUserAction, organizationController.getAllOrganizations)
    .post("/", verifyUserAction, organizationController.createOrganization)
    .get("/:id", verifyUserAction, organizationController.getSingleOrganization)
// .get("")

export default router
