import { Router } from "express";
import authController from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const authRouter = Router();
authRouter.post("/register/interviewer", authMiddleware, authController.CreateInterviewer);
authRouter.post("/login/interviewer", authMiddleware, authController.InterviewerLogin);
authRouter.post("/register/user", authMiddleware, authController.UserRegister);
authRouter.post("/login/user", authMiddleware, authController.UserLogin);
authRouter.post("/register/org", authMiddleware, authController.OrganizationRegister);
authRouter.post("/login/org", authMiddleware, authController.OrganizationLogin);

export default authRouter;
