import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController";

// Validations 
import { registerValidation, loginValidation } from "../validations/authValidation";

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/logout", logoutUser);

export default router;
