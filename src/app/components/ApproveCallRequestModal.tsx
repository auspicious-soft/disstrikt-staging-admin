"use client";

import { X } from "lucide-react";

interface ApproveCallRequestModalProps {
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  data: {
    modelName: string;
    agent: string;
    date: string;
    meetingLink: string;
  };
  meetingLink: string;
  setMeetingLink: (value: string) => void;
}

const ApproveCallRequestModal = ({
  open,
  onClose,
  onApprove,
  onReject,
  data,
  meetingLink,
  setMeetingLink,
}: ApproveCallRequestModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#151112] p-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-ovo uppercase tracking-wide text-white">
            Approve Call Request
          </h2>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border  border-stone-500 text-stone-300 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-4 border-t border-stone-700" />

        {/* Details */}
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="mb-1 text-[10px] text-stone-400">Name of Model</p>
            <p className="text-sm font-medium text-white">
              {data.modelName}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] text-stone-400">Agent</p>
            <p className="text-sm font-medium text-white">
              {data.agent}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] text-stone-400">Date & Time</p>
            <p className="text-sm font-medium text-white">
              {data.date}
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-stone-700" />

        {/* Meeting Link */}
        <div>
          <label className="mb-2 block text-xs text-white">
            Meeting Link
          </label>

          <input
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="Paste URL"
            className="h-12 w-full rounded-lg border border-stone-600 bg-transparent px-4 text-white outline-none focus:border-[#EF476F]"
          />
        </div>

        {/* Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={onReject}
            className="h-12 rounded-lg border border-[#EF476F] text-[#EF476F] transition hover:bg-[#EF476F]/10"
          >
            Reject
          </button>

          <button
            onClick={onApprove}
            className="h-12 rounded-lg bg-[#40A84F] text-white transition hover:bg-[#369444]"
          >
            Approve Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveCallRequestModal;