import { Response } from "express";
import { PrismaClient, MessageType, MessageStatusType } from "@prisma/client";
import sendResponse from "../utils/Response";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { conversationId, text, type = "TEXT", fileUrl } = req.body;

  if (!userId) {
    return sendResponse(res, 401, false, null, "Unauthorized");
  }

  if (!conversationId || !text) {
    return sendResponse(res, 400, false, null, "Conversation ID and text are required");
  }

  try {
    // Verify user is a participant in the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: String(userId)
      }
    });

    if (!participant) {
      return sendResponse(res, 403, false, null, "You are not a participant in this conversation");
    }

    // Get all participants except the sender
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: conversationId,
        userId: { not: String(userId) }
      },
      select: {
        userId: true
      }
    });

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: String(userId),
        type: type as MessageType,
        text: text,
        fileUrl: fileUrl || null,
        statuses: {
          create: [
            // Status for sender (always SENT)
            {
              userId: String(userId),
              status: MessageStatusType.SENT
            },
            // Status for each recipient (initially SENT, will be updated to DELIVERED when they receive it)
            ...participants.map(p => ({
              userId: p.userId,
              status: MessageStatusType.SENT
            }))
          ]
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        statuses: true
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return sendResponse(res, 201, true, message, "Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    return sendResponse(res, 500, false, null, "Failed to send message");
  }
};

export const markMessageAsDelivered = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { messageId } = req.body;

  if (!userId) {
    return sendResponse(res, 401, false, null, "Unauthorized");
  }

  try {
    const status = await prisma.messageStatus.update({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId: String(userId)
        }
      },
      data: {
        status: MessageStatusType.DELIVERED
      }
    });

    return sendResponse(res, 200, true, status, "Message marked as delivered");
  } catch (error) {
    console.error("Error updating message status:", error);
    return sendResponse(res, 500, false, null, "Failed to update message status");
  }
};

export const markMessageAsSeen = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { messageId } = req.body;

  if (!userId) {
    return sendResponse(res, 401, false, null, "Unauthorized");
  }

  try {
    const status = await prisma.messageStatus.update({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId: String(userId)
        }
      },
      data: {
        status: MessageStatusType.SEEN
      }
    });

    return sendResponse(res, 200, true, status, "Message marked as seen");
  } catch (error) {
    console.error("Error updating message status:", error);
    return sendResponse(res, 500, false, null, "Failed to update message status");
  }
};

export const markConversationAsSeen = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { conversationId } = req.params;

  if (!userId) {
    return sendResponse(res, 401, false, null, "Unauthorized");
  }

  try {
    // Mark all messages in conversation as seen for this user
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        senderId: { not: String(userId) } // Only messages from others
      }
    });

    await prisma.messageStatus.updateMany({
      where: {
        messageId: { in: messages.map(m => m.id) },
        userId: String(userId),
        status: { not: MessageStatusType.SEEN }
      },
      data: {
        status: MessageStatusType.SEEN
      }
    });

    return sendResponse(res, 200, true, {}, "Conversation marked as seen");
  } catch (error) {
    console.error("Error marking conversation as seen:", error);
    return sendResponse(res, 500, false, null, "Failed to mark conversation as seen");
  }
};
