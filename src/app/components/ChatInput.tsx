import { Paperclip, Smile, SendHorizontal } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
}: Props) => {
  return (
    <div className="flex items-center rounded-xl gap-3 border-t border-stone-700 bg-[#2B2426] p-3">
      <Smile className="h-5 w-5 text-stone-400" />

      <Paperclip className="h-5 w-5 text-stone-400" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Message"
        className="flex-1 bg-transparent text-sm text-white outline-none"
      />

      <button onClick={onSend}>
        <SendHorizontal className="h-5 w-5 text-rose-500" />
      </button>
    </div>
  );
};

export default ChatInput;