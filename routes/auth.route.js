import AuthController from "../controller/auth.controller.js";
import { Router } from 'express'
import userModel from "../models/user.model.js";
import { verifyUserAction } from "../middlewares/jwt.js";

const authController = new AuthController(userModel)
const router = Router()

router.post("/login", authController.logUserIn)
router.post("/microsoft/sign-up", authController.handleMicrosoftAccountCreation)
router.post("/microsoft/sign-in", authController.handleMicrosoftAccountSignIn)
router.post("/google/sign-in", authController.handleGoogleAccountSignIn)
router.post("/google/sign-up", authController.handleGoogleAccountCreation)
router.get("/me", verifyUserAction, authController.getUserInfo)
router.post("/user-exists", authController.checkIfUserExists)
router.post("/register", authController.registerUser)
router.post("/reset-password", authController.resetPassword)
router.post("/confirm-password-change", authController.confirmPasswordChange)

export default router
