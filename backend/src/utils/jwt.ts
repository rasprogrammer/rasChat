import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export interface TokenPayload {
    id: string;
}


export const generateToken = (id: string): string => {
    return jwt.sign(
        {
            id
        },
        JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
    )
};

export const decodeToken = (token: string) => {
    return jwt.decode(token);
}

export const verifyToken = (token: string, JWT_SECRET: string): TokenPayload | null => {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
}