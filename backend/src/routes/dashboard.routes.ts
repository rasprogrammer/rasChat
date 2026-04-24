import express from "express";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
    return res.json({
        message: 'Dashboard Page'
    });
})

export default router;