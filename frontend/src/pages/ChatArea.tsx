import { useRef, useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";

export default function ChatArea() {

    const messageListRef = useRef<HTMLDivElement>(null);
    const [newMsg, setNewMsg] = useState("");
    const {activeConvId, conversations, users, sendMessage} = useChat();
    
    useEffect(() => {
      // scroll to bottom when active conversation or messages change
      const el = messageListRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [activeConvId, conversations]);
    
    
    const activeConv = conversations.find((c) => c.id === activeConvId) || null;
    const activeOther = activeConv && false ? users.find((u) => u.id === activeConv!.participants.find((p) => p !== "me")) : null;


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
                    activeOther?.online
                      ? "bg-green-400 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {activeOther?.avatar || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {activeOther?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeOther?.online
                      ? "online"
                      : `last seen ${activeOther?.lastSeen || "some time"}`}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activeConv.lastTime}</div>
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
                          m.from === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-xl p-3 max-w-[70%] ${
                            m.from === "me"
                              ? "bg-green-500 text-white"
                              : "bg-white border"
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{m.text}</div>
                          <div
                            className={`text-xs mt-2 ${
                              m.from === "me"
                                ? "opacity-80 text-white/90"
                                : "text-gray-400"
                            }`}
                          >
                            {m.time}
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
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(newMsg)}
                  placeholder="Type a message"
                  className="flex-1 px-3 py-2 rounded-full border"
                />
                <button
                  onClick={() => sendMessage(newMsg)}
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
