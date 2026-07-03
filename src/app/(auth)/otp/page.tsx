"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import AuthBackground from "../../../../public/assets/AuthImage.png";
import logo from "../../../assets/images/Logo2.png";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { sendOtpService } from "@/services/admin-services";
import { toast } from "sonner";
import { useDataContext } from "@/app/components/DataContext";
import Loader from "@/app/admin/components/ui/Loader";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const { dataEmail, setToken } = useDataContext();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    setOtpValues((prev) => {
      const newOtpValues = [...prev];
      newOtpValues[index] = value;
      return newOtpValues;
    });

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFogetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      toast.error("Please enter a complete OTP");
      return;
    }

    setLoading(true);
    startTransition(async () => {
      try {
        const response = await sendOtpService({ otp, value: dataEmail });
        if (response?.status === 200) {
          const token = response.data.data.token;
          setToken(token);
          toast.success("OTP verified successfully");
          router.push("/change-password");
        } else {
          toast.error("Invalid OTP");
        }
      } catch (err: any) {
        setOtpValues(Array(6).fill("")); // clear OTP

        // ✅ Move focus back to the first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }

        if (err.status === 404) {
          toast.error("OTP not found");
        } else if (err.status === 500) {
          toast.error("Server error, please try again later");
        } else if (err.status === 400) {
          toast.error("Invalid or Expired OTP");
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    // if all values are empty, focus back to first input
    if (otpValues.every((v) => v === "")) {
      inputRefs.current[0]?.focus();
    }
  }, [otpValues]);

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

            <div className="relative z-10 flex w-full max-w-[500px] mx-auto md:ml-15 bg-rose-50/95 shadow-2xl rounded-2xl overflow-hidden flex-col h-auto md:h-[580px] md:p-6">
              <form
                onSubmit={handleFogetPassword}
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
                    Enter OTP
                  </h1>
                  <p className="text-black/50 text-sm sm:text-base font-normal">
                    Please enter the OTP received on your email.
                  </p>
                </div>

                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex-1">
                      <input
                        type="text"
                        maxLength={1}
                        value={otpValues[idx]}
                        ref={(el) => {
                          inputRefs.current[idx] = el!;
                        }}
                        onChange={(e) => handleChange(e, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-full text-center px-2 py-4 sm:px-3 sm:py-5 bg-white rounded-[10px] outline outline-rose-100 text-[#815753] placeholder-zinc-400 text-base font-light focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                  ))}
                </div>

                <ArrowButton
                  text="Next"
                  type="submit"
                  disabled={loading || isPending}
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
