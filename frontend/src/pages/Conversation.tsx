// import { useEffect, useState } from "react";
// import type { User, Conversation } from "../types/types";
// import axios from "axios";
// import type { ApiResponse } from "../requests/types";
// import { BASE_URL } from "../utils/urls";

import { useChat } from "../context/ChatContext";
import { avatarDefaultImageURL } from "../utils/urls";

interface ConversationsProps {
  activeConvId: number | string | null;
  setShowUserSearch: (value: boolean) => void;

  logout: () => void;
}

export default function Conversations({
  activeConvId,
  setShowUserSearch,
  logout,
}: ConversationsProps) {

  const { user, users, conversations, selectConversation } = useChat();

  console.log('conversations > ', conversations);

  if (!user) {
    return <><p>User not found</p></>;
  }

  return (
    <>
      {/* Left Pane: Conversations */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0) || "Y"}
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-2 py-1 rounded-md hover:bg-gray-100"
            >
              New
            </button>
            <button
              onClick={logout}
              className="px-2 py-1 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* === Search Conversations === */}
        <div className="p-3">
          <input
            value=""
            onChange={(e) => ""}
            placeholder="Search conversations"
            className="w-full px-3 py-2 rounded-md border"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {conversations.map((c) => {
            c.avatar = avatarDefaultImageURL;
            return (
              <div
                key={c.conversationId}
                onClick={() => selectConversation(c.conversationId)}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                  // active ? "bg-gray-50" : ""
                  ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    // other.online
                    //   ? "bg-green-400 text-white"
                    //   : "bg-gray-200 text-gray-700"
                    "bg-gray-200 text-gray-700"
                  }`}
                >
                  <img src={c.avatar} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.lastTime}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {c.lastMessage || "Say hi!"}
                  </div>
                </div>
                {c.unread ? (
                  <div className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {c.unread}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* <div className="p-3 border-t text-xs text-gray-500">
        </div> */}
      </div>
    </>
  );
}
