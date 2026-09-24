"use client";
import React, { useState, useEffect } from "react";
import MultiTextEditors from "../components/policies/txtEditor";
import {
  useGetPlatformInfo,
  useSavePrivacyPolicy,
  useSaveSupportInfo,
  useSaveTermsAndCondition,
} from "@/hooks/useAdmin";
import { toast } from "sonner";

interface PlatformInfo {
  privacyPolicy: {
    en: string;
    nl: string;
    fr: string;
    es: string;
  };
  termAndCondition: {
    en: string;
    nl: string;
    fr: string;
    es: string;
  };
  support: {
    phone: {
      US: string;
      UK: string;
      BE: string;
      FR: string;
      ES: string;
      NL: string;
    };
    email: {
      US: string;
      UK: string;
      BE: string;
      FR: string;
      ES: string;
      NL: string;
    };
    address: {
      US: string;
      UK: string;
      BE: string;
      en: string;
      nl: string;
      fr: string;
      es: string;
    };
  };
}

const PrivacyPolicyPage: React.FC = () => {
  const [values, setValues] = useState<PlatformInfo>({
    privacyPolicy: { en: "", nl: "", es: "", fr: "" },
    termAndCondition: { en: "", nl: "", es: "", fr: "" },
    support: {
      phone: { US: "", UK: "", BE: "", FR: "", ES: "", NL: "" },
      email: { US: "", UK: "", BE: "", FR: "", ES: "", NL: "" },
      address: { US: "", UK: "", BE: "", en: "", nl: "", es: "", fr: "" },
    },
  });
  const [error, setError] = useState({
    privacy: null as string | null,
    terms: null as string | null,
    contact: null as string | null,
  });
  const [activeTab, setActiveTab] = useState("privacy");

  const {
    data: platformInfo,
    isLoading: isPlatformLoading,
    error: platformError,
  } = useGetPlatformInfo();
  const { mutate: savePrivacyPolicy, isPending: isSavingPrivacy } =
    useSavePrivacyPolicy();
  const { mutate: saveTermsAndCondition, isPending: isSavingTerms } =
    useSaveTermsAndCondition();
  const { mutate: saveSupportInfo, isPending: isSavingSupport } =
    useSaveSupportInfo();

  useEffect(() => {
    if (!platformInfo) return;

    const platformSupport = platformInfo.support || {};

    setValues({
      privacyPolicy: platformInfo.privacyPolicy || {
        en: "",
        nl: "",
        es: "",
        fr: "",
      },
      termAndCondition: platformInfo.termAndCondition || {
        en: "",
        nl: "",
        es: "",
        fr: "",
      },
      support: {
        phone: {
          US: platformSupport.phone?.US || "",
          UK: platformSupport.phone?.UK || "",
          BE: platformSupport.phone?.BE || "",
          FR: platformSupport.phone?.FR || "",
          ES: platformSupport.phone?.ES || "",
          NL: platformSupport.phone?.NL || "",
        },
        email: {
          US: platformSupport.email?.US || "",
          UK: platformSupport.email?.UK || "",
          BE: platformSupport.email?.BE || "",
          FR: platformSupport.email?.FR || "",
          ES: platformSupport.email?.ES || "",
          NL: platformSupport.email?.NL || "",
        },
        address: {
          US: platformSupport.address?.US || "",
          UK: platformSupport.address?.UK || "",
          BE: platformSupport.address?.BE || "",
          en: platformSupport.address?.en || "",
          nl: platformSupport.address?.nl || "",
          fr: platformSupport.address?.fr || "",
          es: platformSupport.address?.es || "",
        },
      },
    });
  }, [platformInfo]);

  useEffect(() => {
    if (!platformError) return;

    setError({
      privacy:
        "An error occurred while fetching platform info. Please try again.",
      terms:
        "An error occurred while fetching platform info. Please try again.",
      contact:
        "An error occurred while fetching platform info. Please try again.",
    });
  }, [platformError]);

  const setDescriptions = {
    setPrivacyPolicy: {
      setEnglish: (content: string) =>
        setValues({
          ...values,
          privacyPolicy: { ...values.privacyPolicy, en: content },
        }),
      setDutch: (content: string) =>
        setValues({
          ...values,
          privacyPolicy: { ...values.privacyPolicy, nl: content },
        }),
      setSpanish: (content: string) =>
        setValues({
          ...values,
          privacyPolicy: { ...values.privacyPolicy, es: content },
        }),
      setFrench: (content: string) =>
        setValues({
          ...values,
          privacyPolicy: { ...values.privacyPolicy, fr: content },
        }),
    },
    setTermAndCondition: {
      setEnglish: (content: string) =>
        setValues({
          ...values,
          termAndCondition: { ...values.termAndCondition, en: content },
        }),
      setDutch: (content: string) =>
        setValues({
          ...values,
          termAndCondition: { ...values.termAndCondition, nl: content },
        }),
      setSpanish: (content: string) =>
        setValues({
          ...values,
          termAndCondition: { ...values.termAndCondition, es: content },
        }),
      setFrench: (content: string) =>
        setValues({
          ...values,
          termAndCondition: { ...values.termAndCondition, fr: content },
        }),
    },
    setSupport: {
      setPhone: (
        country: keyof PlatformInfo["support"]["phone"],
        content: string,
      ) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            phone: { ...values.support.phone, [country]: content },
          },
        }),

      setEmail: (
        country: keyof PlatformInfo["support"]["email"],
        content: string,
      ) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            email: { ...values.support.email, [country]: content },
          },
        }),
      setAddressUS: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, US: content },
          },
        }),
      setAddressUK: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, UK: content },
          },
        }),
      setAddressBelgium: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, BE: content },
          },
        }),
      setAddressEnglish: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, en: content },
          },
        }),
      setAddressDutch: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, nl: content },
          },
        }),
      setAddressSpanish: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, es: content },
          },
        }),
      setAddressFrench: (content: string) =>
        setValues({
          ...values,
          support: {
            ...values.support,
            address: { ...values.support.address, fr: content },
          },
        }),
    },
  };
  const handleSavePrivacyPolicy = async () => {
    setError({ ...error, privacy: null });

    savePrivacyPolicy(values.privacyPolicy, {
      onSuccess: (response: any) => {
        toast.success(
          response?.data?.message || "Privacy Policy saved successfully",
        );
      },
      onError: (err) => {
        setError({
          ...error,
          privacy:
            "An error occurred while saving privacy policy. Please try again.",
        });
        console.error(err);
      },
    });
  };

  const handleSaveTerms = async () => {
    setError({ ...error, terms: null });

    saveTermsAndCondition(values.termAndCondition, {
      onSuccess: (response: any) => {
        toast.success(
          response?.data?.message || "Terms and conditions saved successfully",
        );
      },
      onError: (err) => {
        setError({
          ...error,
          terms:
            "An error occurred while saving terms and conditions. Please try again.",
        });
        console.error(err);
      },
    });
  };

  const handleSaveSupport = async () => {
    setError({ ...error, contact: null });

    saveSupportInfo(values.support, {
      onSuccess: (response: any) => {
        toast.success(
          response?.data?.message || "Contact Us details saved successfully",
        );
      },
      onError: (err) => {
        setError({
          ...error,
          contact:
            "An error occurred while saving support info. Please try again.",
        });
        console.error(err);
      },
    });
  };

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-5">
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex-1 flex justify-between items-center">
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="inline-flex min-w-max gap-2.5 rounded-[50px] bg-neutral-900 p-[3px]">
                <button
                  className={`flex-shrink-0 whitespace-nowrap rounded-[50px] px-6 py-2.5 ${
                    activeTab === "privacy"
                      ? "bg-rose-500 text-white"
                      : "text-stone-200"
                  }`}
                  onClick={() => setActiveTab("privacy")}
                >
                  <span className="text-xs font-normal">Privacy Policy</span>
                </button>

                <button
                  className={`flex-shrink-0 whitespace-nowrap rounded-[50px] px-6 py-2.5 ${
                    activeTab === "terms"
                      ? "bg-rose-500 text-white"
                      : "text-stone-200"
                  }`}
                  onClick={() => setActiveTab("terms")}
                >
                  <span className="text-xs font-normal">
                    Terms & Conditions
                  </span>
                </button>

                <button
                  className={`flex-shrink-0 whitespace-nowrap rounded-[50px] px-6 py-2.5 ${
                    activeTab === "contact"
                      ? "bg-rose-500 text-white"
                      : "text-stone-200"
                  }`}
                  onClick={() => setActiveTab("contact")}
                >
                  <span className="text-xs font-normal">Contact/Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MultiTextEditors */}
        <MultiTextEditors
          activeTab={activeTab}
          values={values}
          setDescriptions={setDescriptions}
        />

        {/* Save Buttons */}
        {isPlatformLoading && (
          <div className="self-stretch text-sm text-stone-300">
            Loading platform information...
          </div>
        )}

        {activeTab === "privacy" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isSavingPrivacy
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isSavingPrivacy ? undefined : handleSavePrivacyPolicy}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isSavingPrivacy ? "Saving..." : "Save Privacy Policy"}
            </div>
          </div>
        )}
        {activeTab === "terms" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isSavingTerms
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isSavingTerms ? undefined : handleSaveTerms}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isSavingTerms ? "Saving..." : "Save Terms & Conditions"}
            </div>
          </div>
        )}
        {activeTab === "contact" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isSavingSupport
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isSavingSupport ? undefined : handleSaveSupport}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isSavingSupport ? "Saving..." : "Save Contact/Support"}
            </div>
          </div>
        )}

        {/* Error */}
        {error[activeTab as keyof typeof error] && (
          <div className="self-stretch text-red-500 text-sm font-normal ">
            {error[activeTab as keyof typeof error]}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
