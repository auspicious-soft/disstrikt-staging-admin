"use client";
import React, { useState, useEffect } from "react";
import MultiTextEditors from "../components/policies/txtEditor";
import {
  getPlanInfo,
  postContactUs,
  postPrivacypolicy,
  postTermsAndCondition,
} from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
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
      UK: string;
      BE: string;
      FR: string;
      ES: string;
      NL: string;
    };
    email: {
      UK: string;
      BE: string;
      FR: string;
      ES: string;
      NL: string;
    };
    address: {
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
      phone: { UK: "", BE: "", FR: "", ES: "", NL: "" },
      email: { UK: "", BE: "", FR: "", ES: "", NL: "" },
      address: { en: "", nl: "", es: "", fr: "" },
    },
  });
  const [isLoading, setIsLoading] = useState({
    privacy: false,
    terms: false,
    contact: false,
  });
  const [error, setError] = useState({
    privacy: null as string | null,
    terms: null as string | null,
    contact: null as string | null,
  });
  const [activeTab, setActiveTab] = useState("privacy");

  // Fetch platform info on mount
  useEffect(() => {
    const fetchPlatformInfo = async () => {
      setIsLoading({ privacy: true, terms: true, contact: true });
      setError({ privacy: null, terms: null, contact: null });
      try {
        const response = await getPlanInfo(`${ADMIN_URLS.GET_PLAN_INFO}`);

        if (response.status === 200) {
          setValues({
            privacyPolicy: response.data.data.privacyPolicy,
            termAndCondition: response.data.data.termAndCondition,
            support: response.data.data.support,
          });
        } else {
          throw new Error("Failed to fetch platform info");
        }
      } catch (err) {
        setError({
          privacy:
            "An error occurred while fetching platform info. Please try again.",
          terms:
            "An error occurred while fetching platform info. Please try again.",
          contact:
            "An error occurred while fetching platform info. Please try again.",
        });
        console.error(err);
      } finally {
        setIsLoading({ privacy: false, terms: false, contact: false });
      }
    };

    fetchPlatformInfo();
  }, []);

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
    setIsLoading({ ...isLoading, privacy: true });
    setError({ ...error, privacy: null });
    const payload = JSON.stringify(values.privacyPolicy);
    try {
      const response = await postPrivacypolicy(
        `${ADMIN_URLS.POST_PRIVACY_POLICY}`,
        payload,
      );

      if (response.status === 200) {
        toast.success(
          response.data.message || "Privacy Policy saved successfully",
        );
      }
    } catch (err) {
      setError({
        ...error,
        privacy:
          "An error occurred while saving privacy policy. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading({ ...isLoading, privacy: false });
    }
  };

  const handleSaveTerms = async () => {
    setIsLoading({ ...isLoading, terms: true });
    setError({ ...error, terms: null });
    const payload = JSON.stringify(values.termAndCondition);
    try {
      const response = await postTermsAndCondition(
        `${ADMIN_URLS.POST_TERMS_CONDITION}`,
        payload,
      );

      if (response.status === 200) {
        toast.success(
          response.data.message || "Terms and conditions saved successfully",
        );
      }
    } catch (err) {
      setError({
        ...error,
        terms:
          "An error occurred while saving terms and conditions. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading({ ...isLoading, terms: false });
    }
  };

  const handleSaveSupport = async () => {
    setIsLoading({ ...isLoading, contact: true });
    setError({ ...error, contact: null });
    const payload = JSON.stringify(values.support);
    try {
      const response = await postContactUs(
        `${ADMIN_URLS.POST_CONTACT_US}`,
        payload,
      );

      if (response.status === 200) {
        toast.success(
          response.data.message || "Contact Us details saved successfully",
        );
      }
    } catch (err) {
      setError({
        ...error,
        contact:
          "An error occurred while saving support info. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading({ ...isLoading, contact: false });
    }
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
        {activeTab === "privacy" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isLoading.privacy
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isLoading.privacy ? undefined : handleSavePrivacyPolicy}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isLoading.privacy ? "Saving..." : "Save Privacy Policy"}
            </div>
          </div>
        )}
        {activeTab === "terms" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isLoading.terms
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isLoading.terms ? undefined : handleSaveTerms}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isLoading.terms ? "Saving..." : "Save Terms & Conditions"}
            </div>
          </div>
        )}
        {activeTab === "contact" && (
          <div
            className={`self-stretch h-12 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 ${
              isLoading.contact
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={isLoading.contact ? undefined : handleSaveSupport}
          >
            <div className="justify-start text-white text-sm font-medium font-['Raleway']">
              {isLoading.contact ? "Saving..." : "Save Contact/Support"}
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
