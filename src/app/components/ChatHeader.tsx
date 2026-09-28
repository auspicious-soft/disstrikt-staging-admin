export interface ChatMessageType {
  id: string;
  message: string;
  sender: "me" | "other";
  time: string;
  // "sending": shown before the server confirms; "failed": can be retried
  status?: "sending" | "failed" | "sent" | "delivered" | "read";
  senderName?: string;
  imageUrl?: string;
  onRetry?: () => void;
}

export interface ChatUser {
  name: string;
  avatar?: string;
}

interface Props {
  name: string;
}

const ChatHeader = ({ name }: Props) => {
  return (
    <div className="border-b border-stone-700 bg-[#2B2426] px-4 py-3">
      <h3 className="text-sm font-medium text-white">
        {name}
      </h3>
    </div>
  );
};

export default ChatHeader;