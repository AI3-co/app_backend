import { Router } from 'express'
import OrganizationController from '../controller/organization.controller.js'

const organizationController = new OrganizationController()

const router = Router()

router
    .get("/", organizationController.getAllOrganizations)
    .post("/", organizationController.createOrganization)
// .get("")
// .get("")

export default router
