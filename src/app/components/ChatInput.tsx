import { useRef } from "react";
import { Paperclip, Smile, SendHorizontal } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  // When set, the paperclip opens an image picker
  onAttach?: (file: File) => void;
  disabled?: boolean;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  onAttach,
  disabled = false,
}: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center rounded-xl gap-3 border-t border-stone-700 bg-[#2B2426] p-3">
      <Smile className="h-5 w-5 text-stone-400" />

      {onAttach ? (
        <>
          <button
            type="button"
            aria-label="Attach photo"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5 text-stone-400 hover:text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAttach(file);
              e.target.value = "";
            }}
          />
        </>
      ) : (
        <Paperclip className="h-5 w-5 text-stone-400" />
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !disabled) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Message"
        className="flex-1 bg-transparent text-sm text-white outline-none"
      />

      <button onClick={onSend} disabled={disabled} className="disabled:opacity-50">
        <SendHorizontal className="h-5 w-5 text-rose-500" />
      </button>
    </div>
  );
};

export default ChatInput;
