"use client";
import Image from "next/image";
import ArrowButton from "@/app/components/Button";
import LoginImg from "../../../../public/assets/curvedMainImg.png";
import AuthBackground from "../../../../public/assets/LoginImg.jpg";
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
              <div className="flex-1 flex flex-col justify-center gap-5 px-6 sm:px-8 py-10 w-full">
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
                    Forgot Password?
                  </h1>
                  <p className="text-zinc-400 text-base font-normal">
                    Please enter your email address to reset your password.{" "}
                  </p>
                </div>
                {/* Form */}
                <form
                  onSubmit={handleFogetPassword}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <InputField
                      type="email"
                      placeholder="Email Address"
                      name="email"
                      value={email}
                      onChange={handleChange}
                    />
                  </div>
                  <ArrowButton
                    type="submit"
                    text="Next"
                    onClick={handleFogetPassword}
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
          </div>
        </>
      )}
    </>
  );
}
