import { AlertTriangle } from "lucide-react";

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
  danger,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  loading: boolean;
  danger?: boolean;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel(e);
      }}
    >
      <div
        className="w-full max-w-sm rounded-[14px] bg-[#111115] p-5 text-stone-100 border border-[#232327]"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle
            className={`h-5 w-5 ${danger ? "text-[#EF476F]" : "text-stone-300"}`}
          />
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <p className="mb-5 text-xs font-normal text-stone-400">
          {description}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-[#212121] px-3 py-2 text-xs font-medium text-white hover:text-stone-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white ${
              danger
                ? "bg-[#EF476F] hover:bg-[#EF476F]/85"
                : "bg-[#212121] hover:bg-[#2a2a2a]"
            } disabled:opacity-60`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};