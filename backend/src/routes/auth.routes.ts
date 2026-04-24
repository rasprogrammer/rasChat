import express from "express";
import { me, signin, signup } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", auth, me);

export default router;