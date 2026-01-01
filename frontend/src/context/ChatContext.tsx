import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { Conversation, LoginData, User } from "./../types/types";
import { uid } from "../utils/uid";
import { formatTime } from "../utils/time";
import { MOCK_CONVERSATIONS, MOCK_USERS } from "./../mock";
import axios from "axios";
import type { ApiResponse } from "../requests/types";
import successHandler from "../requests/successHandler";
import errorHandler from "../requests/errorHandler";

interface ChatContextValue {
  user: User | null;
  users: User[];
  conversations: Conversation[];
  activeConvId: number | string | null;
  newMsg: string;

  login: ({email, password}: LoginData) => void;
  logout: () => void;

  selectConversation: (id: number | string) => void;
  sendMessage: (text: string) => void;
  startConversationWith: (userId: string) => void;

  leftPaneSearch: string;
  setLeftPaneSearch: (v: string) => void;

  filteredConversations: () => Conversation[];
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // all state from your App.tsx goes here

  const [user, setUser] = useState<User | null>(() => {
    try {
      const data = localStorage.getItem("chat_user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const [users] = useState<User[]>(MOCK_USERS);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const data = localStorage.getItem("chat_conversations");
      return data ? JSON.parse(data) : MOCK_CONVERSATIONS;
    } catch {
      return MOCK_CONVERSATIONS;
    }
  });

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [leftPaneSearch, setLeftPaneSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("chat_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("chat_conversations", JSON.stringify(conversations));
  }, [conversations]);

  
  async function login(loginData: LoginData) {


      const response = await axios.post<ApiResponse>("/auth/login", loginData, {
        withCredentials: true,
      });
      console.log("response >>> ", response);
      const data: ApiResponse = successHandler(response.data, {
        notifyOnSuccess: true,
      });
      console.log("data >>> ", data);
    // const response = await fetch("https://api/auth/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ email, password }),
    // });
    //  if (response.ok && data.status === "success") {
    // setUser({ id: "me", name: email.split("@")[0], email, avatar: "", online: true });
    //  }
    console.log(response);
  }

  function logout() {
    setUser(null);
  }

  function selectConversation(id: string | number) {
    setActiveConvId(id.toString());
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );

  }

  function sendMessage(text: string) {
    if (!activeConvId || !text) return;
    const now = formatTime();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: text,
              lastTime: now,
              messages: [...c.messages, { from: "me", text, time: now }],
            }
          : c
      )
    );
  }

  function startConversationWith(userId: string) {
    const existing = conversations.find((c) => c.participants.includes(userId));
    if (existing) {
      selectConversation(existing.id);
      return;
    }

    const newConv: Conversation = {
      id: uid(),
      participants: ["me", userId],
      lastMessage: "",
      lastTime: "",
      unread: 0,
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  }

  function filteredConversations() {
    const q = leftPaneSearch.toLowerCase().trim();
    if (!q) return conversations;
    
    return conversations.filter((c) => {
      const otherId = c.participants.find((p) => p !== "me");
      const other = users.find((u) => u.id === otherId);
      return other?.name.toLowerCase().includes(q);
    });
  }

  return (
    <ChatContext.Provider
      value={{
        user,
        users,
        conversations,
        activeConvId,
        newMsg: "",

        login,
        logout,

        selectConversation,
        sendMessage,
        startConversationWith,

        leftPaneSearch,
        setLeftPaneSearch,
        filteredConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
