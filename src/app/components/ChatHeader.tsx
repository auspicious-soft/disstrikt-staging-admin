export interface ChatMessageType {
  id: string;
  message: string;
  sender: "me" | "other";
  time: string;
  status?: "sent" | "delivered" | "read";
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