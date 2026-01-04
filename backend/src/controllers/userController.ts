import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import sendResponse from "../utils/Response";

const prisma = new PrismaClient();

export const getAllUser = (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string | undefined;
    
    if (search) {
        prisma.user.findMany({
            take: 10,
            where: {
                name: {
                    contains: search,
                }
            }
        })
        .then(users => {
            sendResponse(res, 200, true, {users}, "Users fetched successfully");
        })
        .catch(error => {
            sendResponse(res, 500, false, null, "Failed to fetch users");
        });
    } else {
        prisma.user.findMany({take: 10})
        .then(users => {
            sendResponse(res, 200, true, {users}, "Users fetched successfully");
        })
        .catch(error => {
            sendResponse(res, 500, false, null, "Failed to fetch users");
        });
    }
}