"use client";

import { useState } from "react";
import ChatHeader, { ChatMessageType } from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Props {
  name: string;
  messages: any[];
}

const ChatWindow = ({ name, messages }: Props) => {
  const [text, setText] = useState("");

  return (
    <div className="overflow-hidden rounded-lg  bg-[#201C1D]">
      <ChatHeader name={name} />

      <div
        className="flex h-[500px] flex-col justify-end overflow-y-auto bg-cover bg-center p-5"
        style={{
          backgroundImage: "url('/assets/image.png')",
        }}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <span className="rounded-full bg-[#36496A] px-3 py-1 text-xs text-white">
              Today
            </span>
          </div>

          {messages.map((item) => (
            <ChatMessage key={item.id} message={item} />
          ))}
        </div>
      </div>

      <div className="p-4">
        <ChatInput value={text} onChange={setText} onSend={() => {}} />
      </div>
    </div>
  );
};

export default ChatWindow;
