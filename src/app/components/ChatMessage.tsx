import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import { ChatMessageType } from "./ChatHeader";
import { nameColor } from "@/lib/chatColors";

interface Props {
  message: ChatMessageType;
}

/**
 * One chat bubble. The time and ticks sit on their own line under the text,
 * right-aligned; on a photo without a caption they overlay the photo.
 */
const ChatMessage = ({ message }: Props) => {
  const isMe = message.sender === "me";
  const firstInRun = message.firstInRun ?? true;
  const imageOnly = Boolean(message.imageUrl) && !message.message;
  // A failed message shows "Not sent. Retry" with the time below it, not in the corner
  const failed = isMe && message.status === "failed";

  const ticks =
    isMe &&
    (message.status === "sending" ? (
      <Clock className="h-3 w-3" aria-label="Sending" />
    ) : message.status === "failed" ? (
      <AlertCircle className="h-3.5 w-3.5 text-red-700" aria-label="Not sent" />
    ) : message.status === "sent" ? (
      <Check className="h-3.5 w-3.5" aria-label="Sent" />
    ) : message.status === "read" ? (
      // Blue double tick: read (in a group: read by everyone)
      <CheckCheck className="h-3.5 w-3.5 text-[#0B84FF]" strokeWidth={2.5} aria-label="Read" />
    ) : message.status === "delivered" ? (
      <CheckCheck className="h-3.5 w-3.5" aria-label="Delivered" />
    ) : null);

  const meta = (
    <span
      className={`flex items-center gap-1 whitespace-nowrap text-[10.5px] leading-none ${
        imageOnly
          ? "rounded-full bg-black/45 px-1.5 py-1 text-white"
          : isMe
            ? "text-black/55"
            : "text-stone-400"
      }`}
    >
      {message.time}
      {ticks}
    </span>
  );

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} ${firstInRun ? "mt-3" : "mt-1"}`}>
      <div
        className={`relative max-w-[78%] rounded-2xl shadow-[0_1px_1px_rgba(0,0,0,0.25)] sm:max-w-[65%] ${
          isMe ? "bg-[#72F169] text-black" : "bg-[#332D2F] text-stone-100"
        } ${firstInRun ? (isMe ? "rounded-tr-md" : "rounded-tl-md") : ""} ${
          imageOnly ? "p-1" : "px-3 pb-1.5 pt-2"
        } ${message.status === "sending" ? "opacity-80" : ""}`}
      >
        {message.senderName && (
          <p
            className={`text-[12.5px] font-semibold leading-tight ${imageOnly ? "px-2 pb-1 pt-1" : "mb-1"} ${
              isMe ? "text-black/60" : ""
            }`}
            style={{ color: isMe ? undefined : nameColor(message.senderKey || message.senderName) }}
          >
            {message.senderName}
          </p>
        )}

        {message.imageUrl && (
          <a href={message.imageUrl} target="_blank" rel="noreferrer" className="block">
            <img
              src={message.imageUrl}
              alt="Shared photo"
              className={`max-h-72 rounded-xl object-cover ${imageOnly ? "" : "mb-1.5"}`}
            />
          </a>
        )}

        {message.message ? (
          <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.45]">
            {message.message}
          </p>
        ) : null}

        {imageOnly && !failed ? (
          // Photo without a caption: time/ticks over the photo
          <span className="absolute bottom-2 right-2">{meta}</span>
        ) : (
          // Always on its own line under the text, right-aligned
          <div className="mt-1 flex items-center justify-end gap-2">
            {failed && (
              <p className="text-[11px] font-medium text-red-700">
                Not sent.{" "}
                {message.onRetry && (
                  <button type="button" onClick={message.onRetry} className="underline">
                    Retry
                  </button>
                )}
              </p>
            )}
            {meta}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
