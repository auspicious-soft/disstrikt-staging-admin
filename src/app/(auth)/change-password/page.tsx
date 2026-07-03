"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import AuthBackground from "../../../../public/assets/AuthImage.png";
import logo from "../../../assets/images/Logo2.png";
import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import InputField from "../../components/InputField";
import UpdatePasswordModal from "@/app/components/UpdatePasswordModal";
import { toast } from "sonner";
import { resetPassword } from "@/services/admin-services";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/app/components/DataContext";
import { redirect } from "next/navigation";
import Loader from "@/app/admin/components/ui/Loader";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { token } = useDataContext();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    // 🔹 Validation checks
    if (!password && !confirmPassword) {
      toast.error("Please Enter Password and Confirm Password.");
      return;
    }

    if (password && !confirmPassword) {
      toast.error("Please Enter Confirm Password.");
      return;
    }

    if (!password && confirmPassword) {
      toast.error("Please Enter Both Password and Confirm Password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!token) {
      toast.error("Session Expired try again and update password");
      return;
    }
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await resetPassword({ password, token });
        if (response?.status === 200) {
          toast.success("Password updated successfully");
          setIsModalOpen(true);
        } else {
          toast.error("Failed to update password");
        }
      } catch (err: any) {
        if (err.status === 400) {
          toast.error("Invalid password format");
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCloseModalWithNavigation = () => {
    setIsModalOpen(false);
    redirect("/");
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="min-h-screen w-full bg-neutral-900 relative overflow-hidden font-body flex items-center justify-center px-3 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-12">
            <div className="absolute inset-0">
              <Image
                src={AuthBackground}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="relative z-10 flex w-full max-w-[500px]  mx-auto md:ml-15 bg-rose-50/95 shadow-2xl rounded-2xl overflow-hidden flex-col h-auto md:h-[580px] md:p-6">
              <form
                onSubmit={handleChangePassword}
                className="flex-1 flex flex-col justify-center gap-4 sm:gap-5 px-4 py-6 sm:px-6 sm:py-6 md:px-6 md:py-6 w-full"
              >
                <div className="w-full flex justify-start">
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-28 h-10 sm:w-28 sm:h-14 md:w-46 md:h-16 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-[#815753] font-['ovo'] text-2xl sm:text-4xl font-normal font-heading capitalize">
                    Update Password
                  </h1>
                  <p className="text-black/50 text-sm sm:text-base font-normal">
                    Please enter new password and confirm it.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative w-full">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 bg-white"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="w-4 h-4"
                      >
                        <rect x="4" y="9" width="16" height="11" rx="2" />
                        <path d="M8 9V7a4 4 0 1 1 8 0v2" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative w-full">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 pr-12 bg-white"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="w-4 h-4"
                      >
                        <rect x="4" y="9" width="16" height="11" rx="2" />
                        <path d="M8 9V7a4 4 0 1 1 8 0v2" />
                      </svg>
                    </div>
                    <div
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </div>

                <ArrowButton
                  text="Update Password"
                  type="submit"
                  disabled={loading || isPending}
                />

                <UpdatePasswordModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModalWithNavigation}
                />

                <div className="flex justify-center mt-2 items-center text-zinc-400 text-base font-medium flex-wrap gap-2">
                  <span className="text-black/60">Remember Password?</span>
                  <Link
                    href="/"
                    className="underline text-[#A93E58] hover:opacity-90 transition duration-200 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffccd3]"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
