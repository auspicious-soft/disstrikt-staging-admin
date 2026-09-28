import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
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
        } ${message.status === "sending" ? "opacity-80" : ""}`}
      >
        {message.senderName && (
          <p className="mb-0.5 text-[10px] font-semibold opacity-70">
            {message.senderName}
          </p>
        )}

        {message.imageUrl && (
          <a href={message.imageUrl} target="_blank" rel="noreferrer">
            <img
              src={message.imageUrl}
              alt="Shared photo"
              className="mb-1 max-h-60 rounded-lg object-cover"
            />
          </a>
        )}

        {message.message && (
          <p className="whitespace-pre-wrap break-words">{message.message}</p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
          {message.time}

          {isMe &&
            (message.status === "sending" ? (
              <Clock className="h-3 w-3" aria-label="Sending" />
            ) : message.status === "failed" ? (
              <AlertCircle className="h-3 w-3 text-red-700" aria-label="Not sent" />
            ) : message.status === "sent" ? (
              <Check className="h-3 w-3" />
            ) : (
              <CheckCheck
                className={`h-3 w-3 ${message.status === "read" ? "text-sky-700" : ""}`}
              />
            ))}
        </div>

        {isMe && message.status === "failed" && (
          <p className="mt-1 text-right text-[11px] font-medium text-red-700">
            Not sent.{" "}
            {message.onRetry && (
              <button type="button" onClick={message.onRetry} className="underline">
                Retry
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
