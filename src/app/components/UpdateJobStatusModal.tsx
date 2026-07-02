import React, { RefObject, useState } from "react";
import Image from "next/image";
import { X, MoveRight } from "lucide-react";
import updatePasswordImg from "../../assets/images/updatePassword.png"; // Adjust path as needed

interface UpdateStatusModalProps {
  onClose: () => void;
  handleOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  modalRef: RefObject<HTMLDivElement>;
  selectedJobId: string | null;
  currentStatus: string | null;
  onStatusChange: (jobId: string, status: string) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  onClose,
  handleOverlayClick,
  modalRef,
  selectedJobId,
  currentStatus,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const getAvailableStatuses = (status: string | null) => {
    switch (status) {
      case "PENDING":
        return ["SELECTED", "REJECTED"];
      case "SELECTED":
        return ["REJECTED"];
      case "REJECTED":
        return ["SELECTED"];
      default:
        return ["PENDING", "SELECTED", "REJECTED"];
    }
  };

  const availableStatuses = getAvailableStatuses(currentStatus);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleDoneClick = () => {
    if (selectedJobId && selectedStatus) {
      onStatusChange(selectedJobId, selectedStatus);
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        ref={modalRef}
        className="relative p-7 bg-rose-200 rounded-[30px] shadow-[4px_4px_0px_0px_rgba(239,71,111,1.00)] inline-flex flex-col justify-start items-center gap-7 max-w-md w-full"
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-rose-300 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-zinc-900" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col justify-start items-center gap-5">
          <Image
            src={updatePasswordImg}
            alt="Success"
            width={96}
            height={96}
            className="w-24 h-24"
          />
          <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
            <div className="text-zinc-900 text-4xl font-extrabold ">
              Update Status
            </div>
            <div className="text-center text-neutral-700 text-base font-light ">
              Update the status of the job for the user from the dropdown.
            </div>
          </div>
        </div>

        <select
          className="self-stretch px-4 py-3.5 bg-red-100 rounded-[10px] outline-1 outline-offset-[-1px] outline-neutral-700/30 text-neutral-700 text-sm font-light "
          onChange={handleStatusChange}
          value={selectedStatus}
          disabled={!selectedJobId || !availableStatuses.length}
        >
          <option value="" disabled>
            Select Status
          </option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <button
          onClick={handleDoneClick}
          className={`self-stretch px-2.5 py-4 rounded-[10px] outline outline-offset-[-1px] outline-rose-500 inline-flex justify-center items-center gap-2.5 ${
            selectedStatus
              ? "bg-rose-500 text-white cursor-pointer "
              : "bg-rose-200 text-zinc-900 opacity-50 cursor-not-allowed "
          }`}
          disabled={!selectedStatus}
        >
          <span className="text-base font-extrabold ">Done</span>
          <MoveRight className="w-4 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
