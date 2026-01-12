import { Response } from "express";
import { PrismaClient, ConversationType } from "@prisma/client";
import sendResponse from "../utils/Response";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

export const createConversation = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { participantId } = req.body; // Single participant ID for private conversation

  if (!userId) {
    return sendResponse(res, 401, false, null, "Unauthorized");
  }

  if (!participantId) {
    return sendResponse(res, 400, false, null, "Participant ID is required");
  }

  if (String(userId) === String(participantId)) {
    return sendResponse(res, 400, false, null, "Cannot create conversation with yourself");
  }

  try {
    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.PRIVATE,
        participants: {
          every: {
            userId: {
              in: [String(userId), String(participantId)]
            }
          }
        }
      },
      include: {
        participants: true
      }
    });

    // If conversation exists and has exactly 2 participants (current user + other user)
    if (existingConversation) {
      const participantIds = existingConversation.participants.map(p => p.userId);
      if (participantIds.includes(String(userId)) && participantIds.includes(String(participantId)) && participantIds.length === 2) {
        // Return existing conversation
        const formatted = prepareConversationsFormat([existingConversation], String(userId));
        return sendResponse(res, 200, true, formatted[0], "Conversation already exists");
      }
    }

    // Verify the other participant exists
    const otherUser = await prisma.user.findUnique({
      where: { id: String(participantId) }
    });

    if (!otherUser) {
      return sendResponse(res, 404, false, null, "Participant not found");
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.PRIVATE,
        participants: {
          create: [
            { userId: String(userId) },
            { userId: String(participantId) }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        }
      }
    });

    const formatted = prepareConversationsFormat([conversation], String(userId));
    return sendResponse(res, 201, true, formatted[0], "Conversation created successfully");
  } catch (error) {
    console.error("Error creating conversation:", error);
    return sendResponse(res, 500, false, null, "Failed to create conversation");
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return sendResponse(res, 401, false, null, "Unauthorized");
    }

    try {
        let conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: String(userId)
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                isOnline: true,
                                lastSeen: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1, // last message only
                    include: {
                        statuses: {
                            where: {
                                userId: String(userId)
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // Calculate unread counts for each conversation
        for (const convo of conversations) {
            const allMessages = await prisma.message.findMany({
                where: {
                    conversationId: convo.id,
                    senderId: { not: String(userId) }
                },
                include: {
                    statuses: {
                        where: {
                            userId: String(userId)
                        }
                    }
                }
            });

            const unreadCount = allMessages.filter(msg => {
                const status = msg.statuses[0];
                return !status || status.status !== "SEEN";
            }).length;

            (convo as any).unreadCount = unreadCount;
        }

        conversations = prepareConversationsFormat(conversations, String(userId));

        return sendResponse(res, 200, true, conversations, "Conversations retrieved successfully");
    } catch (error) {
        console.error("Error getting conversations:", error);
        return sendResponse(res, 500, false, null, "Failed to retrieve conversations");
    }
};

export const loadChat = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const conversationId = req.params.id;

    if (!userId || !conversationId) {
        return sendResponse(res, 401, false, null, "Unauthorized");
    }

    try {
        // Verify user is a participant
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId: conversationId,
                userId: String(userId)
            }
        });

        if (!participant) {
            return sendResponse(res, 403, false, null, "You are not a participant in this conversation");
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                statuses: {
                    where: {
                        userId: String(userId)
                    },
                    select: {
                        status: true
                    }
                }
            }
        });

        // Format messages for frontend
        const formattedMessages = messages.map(msg => ({
            messageId: msg.id,
            senderId: msg.senderId,
            text: msg.text,
            fileUrl: msg.fileUrl,
            type: msg.type,
            messageTime: msg.createdAt.toISOString(),
            messageStatus: msg.statuses[0]?.status || "SENT",
            createdAt: msg.createdAt
        }));

        // Mark messages as delivered when loading chat
        await prisma.messageStatus.updateMany({
            where: {
                messageId: { in: messages.map(m => m.id) },
                userId: String(userId),
                status: "SENT"
            },
            data: {
                status: "DELIVERED"
            }
        });

        return sendResponse(res, 200, true, formattedMessages, "Messages loaded successfully");

    } catch (error) {
        console.error("Error loading chat:", error);
        return sendResponse(res, 500, false, null, "Failed to retrieve messages");
    }
}


const prepareConversationsFormat = (conversations: any, currentUserId: string) => {
    const inbox = conversations.map((convo: any) => {
        console.log(convo);
        // Opposite User
        const otherUser = convo.participants
            .map((p: any) => p.user)
            .find((u: any) => u.id !== currentUserId);

        // Last Message
        const lastMsg = convo.messages[0];

        // Last Message Status (for me)
        const myStatus = lastMsg?.statuses.find(
            (s: any) => s.userId === currentUserId
        );

        // Count unread messages
        const unreadCount = convo.messages
            ?.filter((m: any) => m.senderId !== currentUserId)
            ?.filter((m: any) => {
                const status = m.statuses.find((s: any) => s.userId === currentUserId);
                return !status || status.status !== "SEEN";
            })?.length || 0;

        // Format last seen
        const lastSeenFormatted = otherUser?.lastSeen 
            ? new Date(otherUser.lastSeen).toLocaleString() 
            : null;

        // Format last message time
        const lastTimeFormatted = lastMsg?.createdAt 
            ? new Date(lastMsg.createdAt).toLocaleString() 
            : null;

        return {
            conversationId: convo.id,
            userId: otherUser?.id,
            name: otherUser?.name,
            avatar: otherUser?.avatar || null,
            isOnline: otherUser?.isOnline || false,
            lastSeen: lastSeenFormatted,

            lastMessage: lastMsg?.text ?? null,
            lastTime: lastTimeFormatted,
            lastMessageStatus: myStatus?.status ?? null,

            unread: unreadCount > 0 ? unreadCount : null,
            messages: [] // inbox screen pe empty
        };
    });

    return inbox;
}