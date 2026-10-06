export interface ChatMessageType {
  id: string;
  message: string;
  sender: "me" | "other";
  time: string;
  // "sending": shown before the server confirms; "failed": can be retried
  status?: "sending" | "failed" | "sent" | "delivered" | "read";
  senderName?: string;
  // Picks the sender-name colour (their id); falls back to senderName
  senderKey?: string;
  imageUrl?: string;
  onRetry?: () => void;
}

export interface ChatUser {
  name: string;
  avatar?: string;
}

interface Props {
  name: string;
  // e.g. "Online" / "Last seen today at 14:05"
  subtitle?: string;
  online?: boolean;
}

const ChatHeader = ({ name, subtitle, online = false }: Props) => {
  return (
    <div className="border-b border-stone-700 bg-[#2B2426] px-4 py-3">
      <h3 className="text-sm font-medium text-white">
        {name}
      </h3>
      {subtitle && (
        <p
          className={`mt-0.5 flex items-center gap-1.5 text-xs ${online ? "text-green-400" : "text-stone-400"}`}
        >
          {online && <span className="h-1.5 w-1.5 rounded-full bg-green-400" />}
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default ChatHeader;