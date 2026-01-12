import { createContext, useContext, useState, useEffect, useRef } from "react";
import type {LoginData, RegisterData, User } from "./../types/types";
import type { Conversation, Message } from "../types/conversationType";
import { BASE_URL } from "../utils/urls";
import axios from "axios";
import type { ApiResponse } from "../requests/types";
import successHandler from "../requests/successHandler";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

interface ChatContextValue {
  user: User | null;
  users: User[];
  conversations: Conversation[];
  activeConvId: number | string | null;
  newMsg: string;
  socket: Socket | null;
  messages: Message[];

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;

  selectConversation: (id: number | string) => void;
  sendMessage: (text: string) => void;
  startConversationWith: (userId: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  leftPaneSearch: string;
  setLeftPaneSearch: (v: string) => void;

  filteredConversations: () => Conversation[];
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// Helper functions
const getStorageItem = <T,>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(() => 
    getStorageItem("chat_user", null)
  );

  const [users, setUsers] = useState<User[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [activeConvId, setActiveConvId] = useState<string | number | null>(null);

  const [leftPaneSearch, setLeftPaneSearch] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const activeConvIdRef = useRef<string | number | null>(null);

  // Persist to localStorage
  useEffect(() => {
    setStorageItem("chat_user", user);
  }, [user]);

  useEffect(() => {
    setStorageItem("chat_conversations", conversations);
  }, [conversations]);

  // Initialize Socket.IO when user is logged in
  useEffect(() => {
    if (user) {
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      // Connect to Socket.IO server
      const socket = io("http://localhost:8000", {
        auth: {
          token: token
        },
        transports: ["websocket", "polling"],
        withCredentials: true,
        autoConnect: true
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket.IO connected");
        // Join all conversation rooms when conversations are loaded
        const conversationIds = conversations.map(c => String(c.conversationId));
        if (conversationIds.length > 0) {
          socket.emit("join_conversations", conversationIds);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
      });

      socket.on("new_message", (data: { conversationId: string; message: Message }) => {
        console.log("New message received:", data);
        
        // Add message to current messages if it's the active conversation
        const currentActiveConvId = activeConvIdRef.current;
        if (String(currentActiveConvId) === data.conversationId) {
          setMessages(prev => [...prev, data.message]);
          // Mark as delivered
          socket.emit("message_delivered", { messageId: data.message.messageId });
        }

        // Update conversation list
        setConversations(prev =>
          prev.map(conv => {
            if (String(conv.conversationId) === data.conversationId) {
              return {
                ...conv,
                lastMessage: data.message.text,
                lastTime: new Date(data.message.messageTime).toLocaleString(),
                unread: String(currentActiveConvId) !== data.conversationId 
                  ? (conv.unread || 0) + 1 
                  : conv.unread
              };
            }
            return conv;
          })
        );
      });

      socket.on("message_status_update", (data: { messageId: string; status: string }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.messageId === data.messageId
              ? { ...msg, messageStatus: data.status as any }
              : msg
          )
        );
      });

      socket.on("conversation_updated", async (_data: { conversationId: string }) => {
        // Reload conversations when updated
        await loadConversations();
      });

      socket.on("user_status_update", (data: { userId: string; isOnline: boolean; lastSeen: Date | null }) => {
        setConversations(prev =>
          prev.map(conv =>
            String(conv.userId) === String(data.userId)
              ? {
                  ...conv,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen ? new Date(data.lastSeen).toLocaleString() : conv.lastSeen
                }
              : conv
          )
        );
      });

      socket.on("error", (error: { message: string }) => {
        console.error("Socket.IO error:", error);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      // Disconnect socket when user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      activeConvIdRef.current = null;
      setMessages([]);
    }
  }, [user]);

  // Update ref when activeConvId changes
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // Join conversation rooms when conversations change
  useEffect(() => {
    if (socketRef.current && conversations.length > 0) {
      const conversationIds = conversations.map(c => String(c.conversationId));
      socketRef.current.emit("join_conversations", conversationIds);
    }
  }, [conversations]);

  // Reload conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  async function loadConversations() {
    try {
      const response = await axios.get<ApiResponse>(
        `${BASE_URL}/conversations`,
        { withCredentials: true }
      );
      const data = successHandler(response.data);
      const convos = data.data as Conversation[];
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

  // Auth Functions
  async function register({ name, email, password }: RegisterData) {
    try {
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );

      const data = successHandler(response.data, { notifyOnSuccess: true });
      const userData = data.data;

      const userInfo = {
        id: String(userData.userId),
        name: userData.name || userData.email.split("@")[0],
        email: userData.email,
        avatar: "",
        online: true
      };
      setUser(userInfo);
      // Reload conversations after registration
      await loadConversations();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async function login({ email, password }: LoginData) {
    try {
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const data = successHandler(response.data, { notifyOnSuccess: true });
      const userData = data.data;

      setUser({
        id: userData.userId,
        name: userData.email.split("@")[0],
        email: userData.email,
        avatar: "",
        online: true
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await axios.get(`${BASE_URL}/auth/logout`, {
        withCredentials: true
      });
      setUser(null);
      setConversations([]);
      setActiveConvId(null);
      activeConvIdRef.current = null;
      setMessages([]);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  // Conversation Functions
  async function selectConversation(id: string | number) {
    setActiveConvId(id);
    activeConvIdRef.current = id;
    
    // Clear unread count for this conversation
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === id ? { ...c, unread: null } : c
      )
    );

    // Mark conversation as seen
    if (socketRef.current) {
      socketRef.current.emit("message_seen", { conversationId: String(id) });
    }

    // Load messages for this conversation
    try {
      const response = await axios.get<ApiResponse>(
        `${BASE_URL}/conversations/${id}/messages`,
        { withCredentials: true }
      );
      const data = successHandler(response.data);
      const loadedMessages = data.data as any[];
      
      // Format messages
      const formattedMessages: Message[] = loadedMessages.map(msg => ({
        messageId: msg.messageId || msg.id,
        senderId: msg.senderId,
        text: msg.text || "",
        messageTime: msg.messageTime || msg.createdAt,
        messageStatus: msg.messageStatus || msg.statuses?.[0]?.status || "SENT"
      }));

      setMessages(formattedMessages);

      // Mark messages as delivered if they're from others
      if (socketRef.current) {
        formattedMessages
          .filter(msg => msg.senderId !== user?.id)
          .forEach(msg => {
            socketRef.current?.emit("message_delivered", { messageId: msg.messageId });
          });
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  }

  async function sendMessage(text: string) {
    if (!activeConvId || !text.trim() || !user || !socketRef.current) return;

    try {
      // Send via Socket.IO for real-time delivery
      socketRef.current.emit("send_message", {
        conversationId: String(activeConvId),
        text: text.trim(),
        type: "TEXT"
      });

      // Also send via API as backup
      await axios.post(
        `${BASE_URL}/messages`,
        {
          conversationId: String(activeConvId),
          text: text.trim(),
          type: "TEXT"
        },
        { withCredentials: true }
      );

      // Update conversation list immediately (optimistic update)
      const now = new Date().toLocaleString();
      setConversations(prev =>
        prev.map(c =>
          c.conversationId === activeConvId
            ? {
                ...c,
                lastMessage: text.trim(),
                lastTime: now,
                lastMessageStatus: "SENT"
              }
            : c
        )
      );

      // Add message to messages list (optimistic update)
      const tempMessage: Message = {
        messageId: `temp-${Date.now()}`,
        senderId: String(user.id),
        text: text.trim(),
        messageTime: new Date().toISOString(),
        messageStatus: "SENT"
      };
      setMessages(prev => [...prev, tempMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  async function startConversationWith(userId: string) {
    if (!user) return;

    try {
      // Check if conversation already exists
      const existing = conversations.find(c => String(c.userId) === String(userId));
      if (existing) {
        await selectConversation(existing.conversationId);
        return;
      }

      // Create new conversation
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/conversations`,
        { participantId: userId },
        { withCredentials: true }
      );

      const data = successHandler(response.data);
      const newConversation = data.data as Conversation;

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);

      // Select the new conversation
      selectConversation(newConversation.conversationId);

      // Join the conversation room
      if (socketRef.current) {
        socketRef.current.emit("join_conversations", [String(newConversation.conversationId)]);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      throw error;
    }
  }

  function filteredConversations() {
    const query = leftPaneSearch.toLowerCase().trim();
    
    if (!query) return conversations;

    return conversations.filter((c) => {
      return c.name.toLowerCase().includes(query);
    });
  }

  const value: ChatContextValue = {
    user,
    users,
    conversations,
    activeConvId,
    newMsg: "",
    socket: socketRef.current,
    messages,

    register,
    login,
    logout,

    selectConversation,
    sendMessage,
    startConversationWith,
    setMessages,

    leftPaneSearch,
    setLeftPaneSearch,
    filteredConversations,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}