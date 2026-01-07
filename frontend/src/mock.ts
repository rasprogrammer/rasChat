import type { messageStatus, Message, Conversation } from "./types/conversationType";
import type { User } from "./types/types";

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Asha Sharma", avatar: "AS", online: true },
  { id: "u2", name: "Vikram Singh", avatar: "VS", online: false, lastSeen: "2025-12-10 18:05" },
  { id: "u3", name: "Neha Patel", avatar: "NP", online: true },
  { id: "u4", name: "Rohan Mehta", avatar: "RM", online: false, lastSeen: "2025-12-09 10:11" },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    conversationId: 1,
    userId: 22,
    name: 'Rajiv',
    avatar: '',
    isOnline: true,
    lastSeen: '3:03am',
    lastMessage: 'Okay',
    lastTime: '7:04pm',
    unread: null,
    lastMessageStatus: 'SEEN',
    messages: [
      {
        senderId: 22,
        messageId: 1,
        text: "Hello",
        messageTime: '7:01pm',
        messageStatus: 'DELIVERED'
      },
      {
        senderId: 22,
        messageId: 1,
        text: "How are you ?",
        messageTime: '7:01pm',
        messageStatus: 'DELIVERED'
      },
      {
        senderId: 1,
        messageId: 1,
        text: "Hello",
        messageTime: '7:01pm',
        messageStatus: 'DELIVERED'
      }
    ]
  },
  {
    conversationId: 2,
    userId: 24,
    name: 'Amit',
    avatar: '',
    isOnline: true,
    lastSeen: '3:03am',
    lastMessage: 'Hello',
    lastTime: '3:03pm',
    unread: null,
    lastMessageStatus: 'SEEN',
    messages: []
  },
  {
    conversationId: 3,
    userId: 21,
    name: 'Sumit',
    avatar: '',
    isOnline: true,
    lastSeen: '3:03am',
    lastMessage: 'How are you ?',
    lastTime: '7:04pm',
    unread: null,
    lastMessageStatus: 'SEEN',
    messages: []
  },
  {
    conversationId: 4,
    userId: 25,
    name: 'Ravi',
    avatar: '',
    isOnline: false,
    lastSeen: '3:03am',
    lastMessage: 'Hi',
    lastTime: '7:02pm',
    unread: null,
    lastMessageStatus: 'SEEN',
    messages: []
    // messages : [
    //   {
        
    //   }
    // ]
  }
];
