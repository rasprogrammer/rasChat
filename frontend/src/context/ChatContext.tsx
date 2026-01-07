import { createContext, useContext, useState, useEffect } from "react";
import type {LoginData, RegisterData, User } from "./../types/types";
import type { Conversation } from "../types/conversationType";
import { BASE_URL } from "../utils/urls";
import { uid } from "../utils/uid";
import { formatTime } from "../utils/time";
import { MOCK_CONVERSATIONS, MOCK_USERS } from "./../mock";
import axios from "axios";
import type { ApiResponse } from "../requests/types";
import successHandler from "../requests/successHandler";

interface ChatContextValue {
  user: User | null;
  users: User[];
  conversations: Conversation[];
  activeConvId: number | string | null;
  newMsg: string;

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;

  selectConversation: (id: number | string) => void;
  sendMessage: (text: string) => void;
  startConversationWith: (userId: string) => void;

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

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const [activeConvId, setActiveConvId] = useState<string | number | null>(
    // () => conversations[0]?.conversationId || 
    null
  );

  const [leftPaneSearch, setLeftPaneSearch] = useState("");

  // Persist to localStorage
  useEffect(() => {
    setStorageItem("chat_user", user);
  }, [user]);

  useEffect(() => {
    setStorageItem("chat_conversations", conversations);
  }, [conversations]);


  async function register({ name, email, password }: RegisterData) {
    try {
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );

      const data = successHandler(response.data, { notifyOnSuccess: true });
      const userData = data.data;

      setUser({
        id: "me",
        name: userData.email.split("@")[0],
        email: userData.email,
        avatar: "",
        online: true
      });
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
        id: "me",
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
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  // Conversation Functions
  function selectConversation(id: string | number) {
    setActiveConvId(id);
    // setConversations((prev) =>
    //   prev.map((c) => (c.conversationId === id ? { ...c, unread: 0 } : c))
    // );
  }

  function sendMessage(text: string) {
    if (!activeConvId || !text.trim()) return;

    const now = formatTime();
    const newMessage = { from: "me", text: text.trim(), time: now };

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === activeConvId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastTime: now,
            }
          : c
      )
    );
  }

  function startConversationWith(userId: string) {
    // const existing = conversations.find((c) => c.participants.includes(userId));
    
    // if (existing) {
    //   selectConversation(existing.id);
    //   return;
    // }

    // const newConv: Conversation = {
    //   id: uid(),
    //   participants: ["me", userId],
    //   lastMessage: "",
    //   lastTime: "",
    //   unread: 0,
    //   messages: [],
    // };

    // setConversations((prev) => [newConv, ...prev]);
    // setActiveConvId(newConv.id);
  }

  function filteredConversations() {
    const query = leftPaneSearch.toLowerCase().trim();
    
    if (!query) return conversations;

    return conversations.filter((c) => {
      // const otherUserId = c.participants.find((p) => p !== "me");
      // const otherUser = users.find((u) => u.id === otherUserId);
      // return otherUser?.name.toLowerCase().includes(query);
    });
  }

  const value: ChatContextValue = {
    user,
    users,
    conversations,
    activeConvId,
    newMsg: "",

    register,
    login,
    logout,

    selectConversation,
    sendMessage,
    startConversationWith,

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