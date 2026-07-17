"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import AuthBackground from "../../public/assets/AuthImage.png";
import logo from "../assets/images/Logo2.png";
import { EyeOff } from "lucide-react";
import React, { useState } from "react";
import InputField from "./components/InputField";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "./admin/components/ui/Loader";
import { Email,  Lock } from "@/lib/icons";
import { Eye } from "iconoir-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = React.useTransition();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email.trim()) {
    toast.error("Email is required");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  if (!password.trim()) {
    toast.error("Password is required");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }
    toast.success("Login successful");

   window.location.replace("/admin/dashboard");
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

            {/* Auth section */}
            <div className="relative z-10 flex w-full max-w-[510px]  mx-auto md:ml-15 bg-rose-50/95 shadow-2xl rounded-2xl overflow-hidden flex-col h-auto md:h-fit md:p-6">
              {/* Left side: Image */}

              {/* Right side: Login form */}
              <div className="flex-1 flex flex-col justify-center gap-3 p-1 w-full">
                {/* Logo */}
                <div className="w-full flex justify-start mb-2">
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-28 h-10 sm:w-28 sm:h-14 md:w-46 md:h-16 transition-all"
                  />
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-[#815753] font-['ovo'] text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-heading capitalize">
                    LOGIN TO YOUR ID
                  </h1>
                  <p className="text-black/50 text-sm sm:text-base md:text-base lg:text-lg font-normal">
                    Kindly provide your login details to access your account!
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-[#00000080] text-xs sm:text-sm md:text-base lg:text-base font-normal"
                    >
                      Email Address <span className="text-[#EA3838] ">*</span>
                    </label>
                    <div className="relative w-full">
                      <InputField
                        id="email"
                        value={email}
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Email Address"
                        className="pl-12 bg-white"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Email />
                      </div>
                    </div>
                    </div>
                    <div className="flex flex-col">
                    <label
                      htmlFor="password"
                      className="text-[#00000080] text-xs sm:text-sm md:text-base lg:text-base font-normal"
                    >
                      Password <span className="text-[#EA3838] ">*</span>
                    </label>
                    <div className="relative w-full">
                      <InputField
                        id="password"
                        value={password}
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-12 pr-12 bg-white"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Lock />
                      </div>
                      <div
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 text-zinc-500" />
                        ) : (
                          <Eye className="h-5 text-zinc-500" />
                        )}
                      </div>
                    </div>
                    </div>

                    <ArrowButton
                      type="submit"
                      text="Login"
                      disabled={loading || isPending}
                    />

                    <div className="flex justify-center mt-4 items-center text-zinc-400 text-sm sm:text-base md:text-base lg:text-lg font-medium flex-wrap ">
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="underline text-[#A93E58] hover:opacity-90 transition duration-200 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffccd3]"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
