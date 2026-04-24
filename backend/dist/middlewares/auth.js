import { HttpStatus } from "../utils/HttpStatus.js";
import { JWT_SECRET } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
export const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Access Denied: No token provided"
            });
        }
        const decoded = verifyToken(token, JWT_SECRET);
        if (!decoded) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Invalid token"
            });
        }
        req.auth = { id: decoded.id };
        next();
    }
    catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Internal server error"
        });
    }
};
//# sourceMappingURL=auth.js.map