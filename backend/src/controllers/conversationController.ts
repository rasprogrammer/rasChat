import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import sendResponse from "../utils/Response";

const prisma = new PrismaClient();

type AuthRequest = Request & { user?: { userId?: number | string } };

export const createConversation = async (req: AuthRequest, res: Response) => {
  const { participantIds } = req.body;
//   const userId = req.user.userId;

    try {
        // const conversation = await prisma.conversation.create({
        //     data: {
        //         participants: {
        //             connect: participantIds.map((id: number) => ({ id })),
        //         },
        //     },
        // }); 

        const conversation = {};
        return sendResponse(res, 201, true, conversation, "Conversation created successfully");
    } catch (error) {
        return sendResponse(res, 500, false, null, "Failed to create conversation");
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return sendResponse(res, 401, false, null, "Unauthorized");
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: String(userId) },
                },
            },
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        return sendResponse(res, 200, true, conversations, "Conversations retrieved successfully");
    } catch (error) {
        return sendResponse(res, 500, false, null, "Failed to retrieve conversations");
    }
};