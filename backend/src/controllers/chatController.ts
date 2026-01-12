import Express, {Request, Response} from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

const router = Express.Router();

router.get('/', (req: AuthRequest, res: Response) => {
    
});

export default router;