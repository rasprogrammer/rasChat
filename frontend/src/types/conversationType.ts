export type messageStatus = 'SEEN' | 'DELIVERED' | 'SENT';

export interface Conversation {
    conversationId: number;
    userId: number;
    name: string;
    avatar: string;
    lastSeen: string;
    lastMessage: string;
    isOnline: boolean;
    lastTime: string;
    unread: number | null;
    lastMessageStatus: messageStatus;
    messages: Message[];
}

export interface Message {
    senderId: number;
    messageId: number;
    text: string;
    messageTime: string;
    messageStatus: messageStatus;
}