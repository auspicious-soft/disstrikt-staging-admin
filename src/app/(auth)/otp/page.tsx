"use client";

import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import AuthBackground from "../../../../public/assets/AuthImage.png";
import logo from "../../../assets/images/Logo2.png";
import React, { useState } from "react";
import { toast } from "sonner";
import Loader from "@/app/admin/components/ui/Loader";
import Link from "next/link";
import InputField from "@/app/components/InputField";
import { useRouter } from "next/navigation";

export default function Home() {
  const [otp, setOtp] = useState("");
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    console.log("OTP:", otp);
    router.push("/change-password")

    // Call your API here
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
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

          <div className="relative z-10 flex w-full max-w-[500px] mx-auto md:ml-15 bg-rose-50/95 shadow-2xl rounded-2xl overflow-hidden flex-col h-auto md:h-fit md:p-6">
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col justify-center gap-3 p-1 w-full"
            >
              <div className="w-full flex justify-start mb-5">
                <Image
                  src={logo}
                  alt="logo"
                  className="w-28 h-10 sm:w-28 sm:h-14 md:w-46 md:h-16 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-[#815753] font-['ovo'] text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-heading capitalize">
                  ENTER OTP
                </h1>
                <p className="text-black/50 text-sm sm:text-base md:text-base lg:text-lg font-normal">
                  Please enter the OTP received on your email.
                </p>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="otp"
                  className="text-[#00000080] text-xs sm:text-sm md:text-base lg:text-base font-normal"
                >
                  OTP <span className="text-[#EA3838]">*</span>
                </label>
                <InputField
                  type="text"
                  placeholder="Enter OTP"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  className="bg-white"
                  maxLength={6}
                />
              </div>

              <ArrowButton text="Verify OTP" type="submit" disabled={loading} />

              <div className="flex justify-center mt-2 items-center text-zinc-400 text-sm sm:text-base md:text-base lg:text-lg font-medium flex-wrap gap-2">
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
      )}
    </>
  );
}
