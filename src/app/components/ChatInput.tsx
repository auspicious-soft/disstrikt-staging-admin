import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Paperclip, Smile, SendHorizontal } from "lucide-react";
import { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";

// Browser-only, and loaded the first time the picker opens
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

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
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  // Where the cursor was, so an emoji goes there and not at the end
  const caret = useRef<{ start: number; end: number } | null>(null);

  const rememberCaret = () => {
    const input = inputRef.current;
    if (input) {
      caret.current = {
        start: input.selectionStart ?? input.value.length,
        end: input.selectionEnd ?? input.value.length,
      };
    }
  };

  // Close on a click outside the picker or on Escape
  useEffect(() => {
    if (!showEmoji) return;
    const onClick = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setShowEmoji(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmoji(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showEmoji]);

  const insertEmoji = (emoji: EmojiClickData) => {
    const { start, end } = caret.current ?? { start: value.length, end: value.length };
    const next = value.slice(0, start) + emoji.emoji + value.slice(end);
    onChange(next);
    const position = start + emoji.emoji.length;
    caret.current = { start: position, end: position };
    // Keep typing after the emoji
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(position, position);
    });
  };

  return (
    <div className="relative flex items-center rounded-xl gap-3 border-t border-stone-700 bg-[#2B2426] p-3">
      <div ref={pickerRef} className="flex">
        <button
          type="button"
          aria-label="Add emoji"
          aria-expanded={showEmoji}
          disabled={disabled}
          onClick={() => {
            rememberCaret();
            setShowEmoji((open) => !open);
          }}
          className="disabled:opacity-50"
        >
          <Smile
            className={`h-5 w-5 hover:text-white ${showEmoji ? "text-white" : "text-stone-400"}`}
          />
        </button>
        {showEmoji && (
          <div className="absolute bottom-full left-0 z-50 mb-2">
            <EmojiPicker
              onEmojiClick={insertEmoji}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              width={300}
              height={340}
              lazyLoadEmojis
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

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
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={rememberCaret}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !disabled) {
            e.preventDefault();
            setShowEmoji(false);
            onSend();
          }
        }}
        placeholder="Message"
        className="flex-1 bg-transparent text-sm text-white outline-none"
      />

      <button
        onClick={() => {
          setShowEmoji(false);
          onSend();
        }}
        disabled={disabled}
        className="disabled:opacity-50"
      >
        <SendHorizontal className="h-5 w-5 text-rose-500" />
      </button>
    </div>
  );
};

export default ChatInput;
