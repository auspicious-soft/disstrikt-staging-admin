"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import LoginImg from "../../../../public/assets/curvedMainImg.png";
import AuthBackground from "../../../../public/assets/LoginImg.jpg";
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
          <div className="w-full h-screen bg-neutral-900 relative overflow-hidden font-body flex justify-center items-center">
            <div className="absolute inset-0">
              <Image
                src={AuthBackground}
                alt=""
                fill
                className="object-cover"
                priority
              />

            </div>
            <div className="absolute w-[916px] h-[916px] left-1/2 top-[54px] -translate-x-1/2 bg-rose-200/20 blur-[250px]" />
            <div className="relative z-10 flex w-full max-w-6xl bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl overflow-hidden flex-col md:flex-row-reverse h-full md:h-[550px] md:p-6 gap-x-16">
              <div className="hidden md:flex flex-1 relative w-full h-auto overflow-hidden rounded-xl">
                <Image
                  src={LoginImg}
                  alt="Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <form
                onSubmit={handleChangePassword}
                className="flex-1 flex flex-col justify-center gap-5 px-6 sm:px-8 py-10 w-full"
              >
                <div className="w-full flex justify-start">
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-30 h-20 sm:w-30 sm:h-20 md:w-30 md:h-20 transition-all"
                  />
                </div>
                {/* Heading */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-stone-200 text-3xl font-extrabold font-heading capitalize">
                    Update Password
                  </h1>
                  <p className="text-zinc-400 text-base font-normal">
                    Please enter new password and confirm it.
                  </p>
                </div>
                {/* Form */}
                <div className="flex flex-col gap-5">
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative w-full">
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-12"
                  />
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                <ArrowButton text="Update Password" type="submit" />

                <UpdatePasswordModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModalWithNavigation}
                />

                <div className="flex items-center justify-center gap-2  mt-[-4px] font-normal">
                  <span> Remember Password? </span>
                  <Link
                    href="/"
                    className="text-m text-[#ffccd3] underline-offset-2 hover:underline"
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
