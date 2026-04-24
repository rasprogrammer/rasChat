import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../utils/request-type.js";
export declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map