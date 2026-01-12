export type messageStatus = 'SEEN' | 'DELIVERED' | 'SENT';

export interface Conversation {
    conversationId: number | string;
    userId: number | string;
    name: string;
    avatar: string;
    lastSeen: string | null;
    lastMessage: string | null;
    isOnline: boolean;
    lastTime: string | null;
    unread: number | null;
    lastMessageStatus: messageStatus | null;
    messages: Message[];
}

export interface Message {
    senderId: string;
    messageId: string;
    text: string;
    messageTime: string;
    messageStatus: messageStatus;
}