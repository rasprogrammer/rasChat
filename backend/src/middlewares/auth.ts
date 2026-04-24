import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../utils/request-type.js";
import { HttpStatus } from "../utils/HttpStatus.js";
import { JWT_SECRET } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Access Denied: No token provided"
            });
        }

        const decoded = verifyToken(token, JWT_SECRET as string);
        if (!decoded) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Invalid token"
            });
        }

        req.auth = { id: decoded.id };
        next();

    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false, 
            error: "Internal server error"
        });
    }

}