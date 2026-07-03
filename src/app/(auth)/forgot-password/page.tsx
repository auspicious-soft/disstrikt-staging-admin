"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import AuthBackground from "../../../../public/assets/AuthImage.png";
import logo from "../../../assets/images/Logo2.png";
import InputField from "../../components/InputField";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { forgotPasswordService } from "@/services/admin-services";
import { toast } from "sonner";
import { useDataContext } from "@/app/components/DataContext";
import Loader from "@/app/admin/components/ui/Loader";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Email } from "@/lib/icons";

export default function Home() {
  const [email, setEmail] = useState("");
  const { setDataEmail } = useDataContext();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleFogetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setDataEmail(email);
    if (!email) {
      toast.error("Please Enter your Email address");
      return;
    }
    startTransition(async () => {
      setLoading(true);
      try {
        const response = await forgotPasswordService({ email: email });
        if (response?.status === 200) {
          toast.success("OTP sent successfully");
          router.push("/otp");
        } else {
          toast.error("User not Found");
        }
      } catch (err: any) {
        if (err.status == 400) toast.error("User not found");
        else toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
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

            <div className="relative z-10 flex w-full max-w-[500px]  mx-auto md:ml-15 bg-rose-50/95 shadow-2xl rounded-2xl overflow-hidden flex-col h-auto md:h-[480px] md:p-6">
              <div className="flex-1 flex flex-col justify-center gap-4 sm:gap-5 px-4 py-6 sm:px-6 sm:py-6 md:px-6 md:py-6 w-full">
                <div className="w-full flex justify-start">
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-28 h-10 sm:w-28 sm:h-14 md:w-46 md:h-16 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-[#815753] font-['ovo'] text-2xl sm:text-4xl font-normal font-heading capitalize">
                    Forgot Password
                  </h1>
                  <p className="text-black/50 text-sm sm:text-base font-normal">
                    Please enter your email address to reset your password.
                  </p>
                </div>

                <form
                  onSubmit={handleFogetPassword}
                  className="flex flex-col gap-3 sm:gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor=""
                      className="text-[#00000080] text-xs sm:text-base font-normal"
                    >
                      Email Address <span className="text-[#EA3838]">*</span>
                    </label>
                    <div className="relative w-full">
                      <InputField
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        className="pl-12 bg-white"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Email />
                      </div>
                    </div>
                  </div>

                  <ArrowButton
                    type="submit"
                    text="Next"
                    onClick={handleFogetPassword}
                    disabled={loading || isPending}
                  />

                  <div className="flex justify-center mt-4 items-center text-zinc-400 text-base font-medium flex-wrap gap-2">
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
          </div>
        </>
      )}
    </>
  );
}
