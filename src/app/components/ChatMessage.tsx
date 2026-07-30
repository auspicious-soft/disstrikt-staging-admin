import { CheckCheck } from "lucide-react";
import { ChatMessageType } from "./ChatHeader";

interface Props {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: Props) => {
  const isMe = message.sender === "me";

  return (
    <div
      className={`flex ${
        isMe ? "justify-end" : "justify-start "
      }`}
    >
      <div
        className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
          isMe
            ? "bg-[#72F169] text-black"
            : "bg-[#332D2F] text-white"
        }`}
      >
        <p>{message.message}</p>

        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
          {message.time}

          {isMe && (
            <CheckCheck className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;