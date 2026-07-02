"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";
import updatePasswordImg from "../../../public/assets/updatePassword.png";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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
        className="p-7 bg-rose-200 rounded-[30px] shadow-[4px_4px_0px_0px_rgba(239,71,111,1.00)] inline-flex flex-col justify-start items-center gap-7"
      >
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
              Password Updated!
            </div>
            <div className="text-center text-neutral-700 text-base font-light ">
              Your password has been updated successfully!
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="self-stretch px-2.5 py-4 bg-rose-200 rounded-[10px] outline  outline-offset-[-1px] outline-rose-500 inline-flex justify-center items-center gap-2.5 cursor-pointer"
        >
          <span className="text-zinc-900 text-base font-extrabold ">Login</span>
          <MoveRight className="w-4 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
