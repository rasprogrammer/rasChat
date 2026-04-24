import jwt from "jsonwebtoken";
export interface TokenPayload {
    id: string;
}
export declare const generateToken: (id: string) => string;
export declare const decodeToken: (token: string) => string | jwt.JwtPayload | null;
export declare const verifyToken: (token: string, JWT_SECRET: string) => TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map