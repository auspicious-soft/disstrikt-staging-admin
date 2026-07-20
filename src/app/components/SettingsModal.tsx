"use client";
import * as React from "react";
import { File, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "../admin/components/ui/Loader";
import { BellNotification, Notes } from "iconoir-react";

export default function SettingsModal({ isOpen, onClose }) {
  const modalRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // ✅ Reset confirmation modal when main modal closes
      setShowLogoutConfirm(false);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRedirectAccount = () => {
    router.push("/admin/account-settings");
    onClose();
  };

  const handleRedirectTermsUse = () => {
    router.push("/admin/terms&conditions");
    onClose();
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("token");
      router.push("/");
      onClose();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
    onClose(); // ✅ also close SettingsModal
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          ></div>

          {/* Settings Modal */}
          <div
            className={`top-15 fixed left-2 w-72 z-50 transition-all duration-300 ease-in-out ${
              isOpen
                ? "opacity-100 translate-y-[calc(100%+0.5rem)]"
                : "opacity-0 translate-y-[calc(100%+2rem)]"
            }`}
          >
            <div
              ref={modalRef}
              className="w-72 px-3.5 py-5 bg-stone-950 rounded-[10px] outline outline-offset-[-1px] outline-stone-700 inline-flex flex-col justify-start items-start gap-4 shadow-lg"
            >
              {/* Account Settings */}
              <button
                className="inline-flex justify-start items-center gap-3.5 cursor-pointer"
                type="button"
                onClick={handleRedirectAccount}
              >
                <img
                  className="w-9 h-9 rounded"
                  src="https://placehold.co/36x36"
                />
                <div className="inline-flex flex-col justify-center items-start gap-1.5">
                  <div className="justify-start text-stone-200 text-sm font-normal ">
                    Account Settings
                  </div>
                  <div className="justify-start text-stone-200 text-[10px] font-normal ">
                    info@disstriktapp.com
                  </div>
                </div>
              </button>

              <div className="self-stretch h-0 outline outline-offset-[-0.50px] outline-stone-700"></div>

              {/* Terms Of Use */}
              <button
                className="inline-flex justify-start items-center gap-3.5 bg-transparent border-none cursor-pointer"
                type="button"
                onClick={handleRedirectTermsUse}
              >
                <div className="w-4 h-4 relative overflow-hidden">
                  <File className="w-4 h-4 text-stone-200" />
                </div>
                <div className="justify-start text-stone-200 text-sm font-normal  leading-tight">
                  Terms Of Use
                </div>
              </button>
              <button
                className="inline-flex justify-start items-center gap-3.5 bg-transparent border-none cursor-pointer"
                type="button"
                onClick={() => (router.push("/admin/notifications",onClose()))}
              >
                <div className="w-4 h-4 relative overflow-hidden">
                  <BellNotification className="w-4 h-4 text-stone-200" />
                </div>
                <div className="justify-start text-stone-200 text-sm font-normal  leading-tight">
                  Notifications
                </div>
              </button>
              <button
                className="inline-flex justify-start items-center gap-3.5 bg-transparent border-none cursor-pointer"
                type="button"
                onClick={() => (router.push("/admin/disstriktonites",onClose()))}
              >
                <div className="w-4 h-4 relative overflow-hidden">
                  <Notes className="w-4 h-4 text-stone-200" />
                </div>
                <div className="justify-start text-stone-200 text-sm font-normal  leading-tight">
                  Disstriktonites
                </div>
              </button>

              <div className="self-stretch h-0 outline outline-offset-[-0.50px] outline-stone-700"></div>

              {/* Logout */}
              <button
                className="inline-flex justify-start items-center gap-3.5 bg-transparent border-none cursor-pointer"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <div className="w-4 h-4 relative overflow-hidden">
                  <LogOut className="w-4 h-4 text-stone-200" />
                </div>
                <div className="justify-start text-stone-200 text-sm font-normal  leading-tight">
                  Log Out
                </div>
              </button>
            </div>
          </div>

          {/* ✅ Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <>
              <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()} // 🚀 prevent bubbling
                className="w-72 px-3.5 py-5 bg-stone-950 rounded-[10px] outline outline-offset-[-1px] outline-stone-700 inline-flex flex-col justify-start items-start gap-4 shadow-lg"
              >
                <div className="fixed inset-0 bg-black/60 z-50"></div>
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-stone-950 rounded-xl p-6 w-80 shadow-lg text-center border border-stone-700">
                    <h3 className="text-lg font-semibold text-stone-200 mb-3">
                      Confirm Logout
                    </h3>
                    <p className="text-sm text-stone-400 mb-6">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex justify-between gap-4">
                      <button
                        className="flex-1 py-2 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 cursor-pointer"
                        onClick={handleCancelLogout}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
