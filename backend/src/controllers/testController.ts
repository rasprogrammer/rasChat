import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const testquery = async (req: Request, res: Response) => {
    const users = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: '7bd3cd9c-9363-4db0-b5d6-7afa3bfc0eb7'
                }
            }
        }
    });

    return res.json({
        message: "success",
        data : users
    });
}
