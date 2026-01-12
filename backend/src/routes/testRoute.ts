import Express from "express";
import { testquery } from "../controllers/testController";

const router = Express.Router();

router.post('/', testquery);

export default router;