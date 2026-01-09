import { useRef, useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";

export default function ChatArea() {

    const messageListRef = useRef<HTMLDivElement>(null);
    const [newMsg, setNewMsg] = useState("");
    const {activeConvId, conversations, user, users, sendMessage} = useChat();

    const sendMessageToUser = () => {
      sendMessage(newMsg);
      setNewMsg("");
    };

    if (!user) {
      return <>Please login</>;
    }
    
    useEffect(() => {
      // scroll to bottom when active conversation or messages change
      const el = messageListRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [activeConvId, conversations]);
    
    const activeConv = conversations.find((c) => c.conversationId === activeConvId) || null;
    console.log('activeConv > ', activeConv);
    
    const userId = parseInt(user.id);

    return (
      <>
        {/* Right Pane: Chat area */}
        <div className="flex-1 flex flex-col">
          {!activeConv ? (
            <div className="flex-1 grid place-items-center text-gray-400">
              Select a conversation or start a new chat
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    activeConv?.isOnline
                      ? "bg-green-400 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  
                  <img src={activeConv?.avatar || ""} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {activeConv?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeConv?.isOnline
                      ? "online"
                      : `last seen ${activeConv?.lastSeen || "some time"}`}
                  </div>
                </div>
                {/* <div className="text-sm text-gray-500">{activeConv.lastTime}</div> */}
              </div>

              <div className="flex-1 overflow-auto p-4" ref={messageListRef}>
                <div className="space-y-3 max-w-5xl">
                  {activeConv.messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12">
                      No messages yet. Say hello 👋
                    </div>
                  ) : (
                    activeConv.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          m.senderId === userId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-xl p-3 max-w-[70%] ${
                            m.senderId === userId
                              ? "bg-green-500 text-white"
                              : "bg-white border"
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{m.text}</div>
                          <div
                            className={`text-xs mt-2 ${
                              m.senderId === userId
                                ? "opacity-80 text-white/90"
                                : "text-gray-400"
                            }`}
                          >
                            {m.messageTime}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 border-t flex items-center gap-3">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessageToUser()}
                  placeholder="Type a message"
                  className="flex-1 px-3 py-2 rounded-full border"
                />
                <button
                  onClick={() => sendMessageToUser()}
                  className="px-4 py-2 rounded-full bg-green-500 text-white font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
}
