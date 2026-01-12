import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwt";
import { PrismaClient, MessageStatusType } from "@prisma/client";

const prisma = new PrismaClient();

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('access_token=')[1]?.split(';')[0];
    
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = verifyToken(token);
      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: any) => {
    const userId = String(socket.userId);
    connectedUsers.set(userId, socket.id);

    // Update user online status
    prisma.user.update({
      where: { id: userId },
      data: { isOnline: true }
    }).catch(console.error);

    // Broadcast user online status to their conversations
    updateUserOnlineStatus(userId, true, io);

    console.log(`User ${userId} connected: ${socket.id}`);
    console.log(`Total connected users: ${connectedUsers.size}`);

    // Join user's conversation rooms
    socket.on("join_conversations", async (conversationIds: string[]) => {
      conversationIds.forEach((convId: string) => {
        socket.join(`conversation:${convId}`);
      });
    });

    // Handle sending messages
    socket.on("send_message", async (data: {
      conversationId: string;
      text: string;
      type?: string;
      fileUrl?: string;
    }) => {
      try {
        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId: data.conversationId,
            userId: userId
          }
        });

        if (!participant) {
          socket.emit("error", { message: "Not a participant in this conversation" });
          return;
        }

        // Get all participants
        const participants = await prisma.conversationParticipant.findMany({
          where: {
            conversationId: data.conversationId
          },
          select: {
            userId: true
          }
        });

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            type: (data.type as any) || "TEXT",
            text: data.text,
            fileUrl: data.fileUrl || null,
            statuses: {
              create: [
                {
                  userId: userId,
                  status: MessageStatusType.SENT
                },
                ...participants
                  .filter(p => p.userId !== userId)
                  .map(p => ({
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
            }
          }
        });

        // Update conversation
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() }
        });

        // Format message for frontend
        const formattedMessage = {
          messageId: message.id,
          senderId: message.senderId,
          text: message.text,
          fileUrl: message.fileUrl,
          type: message.type,
          messageTime: message.createdAt.toISOString(),
          messageStatus: "SENT",
          createdAt: message.createdAt
        };

        // Emit to all participants in the conversation
        io.to(`conversation:${data.conversationId}`).emit("new_message", {
          conversationId: data.conversationId,
          message: formattedMessage
        });

        // Update conversation list for participants
        const otherParticipants = participants.filter(p => p.userId !== userId);
        for (const participant of otherParticipants) {
          const socketId = connectedUsers.get(participant.userId);
          if (socketId) {
            io.to(socketId).emit("conversation_updated", {
              conversationId: data.conversationId
            });
          }
        }

      } catch (error) {
        console.error("Error sending message via socket:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle message delivered
    socket.on("message_delivered", async (data: { messageId: string }) => {
      try {
        await prisma.messageStatus.updateMany({
          where: {
            messageId: data.messageId,
            userId: userId,
            status: MessageStatusType.SENT
          },
          data: {
            status: MessageStatusType.DELIVERED
          }
        });

        // Get message to find conversation
        const message = await prisma.message.findUnique({
          where: { id: data.messageId },
          select: { conversationId: true, senderId: true }
        });

        if (message && message.senderId !== userId) {
          const senderSocketId = connectedUsers.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_status_update", {
              messageId: data.messageId,
              status: "DELIVERED"
            });
          }
        }
      } catch (error) {
        console.error("Error marking message as delivered:", error);
      }
    });

    // Handle message seen
    socket.on("message_seen", async (data: { conversationId: string }) => {
      try {
        // Mark all messages in conversation as seen
        const messages = await prisma.message.findMany({
          where: {
            conversationId: data.conversationId,
            senderId: { not: userId }
          }
        });

        await prisma.messageStatus.updateMany({
          where: {
            messageId: { in: messages.map(m => m.id) },
            userId: userId,
            status: { not: MessageStatusType.SEEN }
          },
          data: {
            status: MessageStatusType.SEEN
          }
        });

        // Notify other participants
        const participants = await prisma.conversationParticipant.findMany({
          where: {
            conversationId: data.conversationId,
            userId: { not: userId }
          }
        });

        for (const participant of participants) {
          const socketId = connectedUsers.get(participant.userId);
          if (socketId) {
            io.to(socketId).emit("conversation_seen", {
              conversationId: data.conversationId,
              userId: userId
            });
          }
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // Handle typing indicator
    socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId: userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      connectedUsers.delete(userId);

      // Update user offline status
      prisma.user.update({
        where: { id: userId },
        data: { 
          isOnline: false,
          lastSeen: new Date()
        }
      }).catch(console.error);

      // Broadcast user offline status
      updateUserOnlineStatus(userId, false, io);

      console.log(`User ${userId} disconnected`);
      console.log(`Total connected users: ${connectedUsers.size}`);
    });
  });

  return io;
}

async function updateUserOnlineStatus(userId: string, isOnline: boolean, io: SocketIOServer) {
  try {
    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      select: {
        id: true,
        participants: {
          select: {
            userId: true
          }
        }
      }
    });

    // Notify all participants in these conversations
    for (const conv of conversations) {
      const otherParticipants = conv.participants
        .filter(p => p.userId !== userId)
        .map(p => p.userId);

      for (const participantId of otherParticipants) {
        const socketId = connectedUsers.get(participantId);
        if (socketId) {
          io.to(socketId).emit("user_status_update", {
            userId: userId,
            isOnline: isOnline,
            lastSeen: isOnline ? null : new Date()
          });
        }
      }
    }
  } catch (error) {
    console.error("Error updating user online status:", error);
  }
}
