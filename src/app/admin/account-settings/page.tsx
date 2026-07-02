"use client";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import {
  getAdminDataaa,
  UpdateAdminData,
  uploadAnything,
} from "@/services/admin-services";
import React, { useState, useEffect } from "react";
import { toast } from "sonner"; // for toast notifications
import Loader from "../components/ui/Loader";
import { Eye, EyeOff } from "lucide-react";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    oldPassword: "",
    password: "",
    file: "", // for preview or stored URL
  });
  const [fileKey, setFileKey] = useState("");
  const [file, setFile] = useState<File | null>(null); // keep original file for upload
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  // ✅ Handle Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file); // keep actual file for upload
      setFormData((prev) => ({ ...prev, file: URL.createObjectURL(file) })); // preview
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) {
      toast.error("No file selected for upload");
      throw new Error("No file selected");
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const response = await uploadAnything(
        ADMIN_URLS.UPLOAD_ANYTHING,
        formData,
      );

      if (response.status === 201) {
        toast.success("File uploaded successfully");
        const fileData = response.data.data.key;
        setFileKey(fileData);
        return fileData; // Return the URL key
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Admin Data
  const getAdminData = async () => {
    setLoading(true);
    try {
      const response = await getAdminDataaa(`${ADMIN_URLS.GET_ADMIN_DATA}`);
      if (response.status === 200) {
        const resData = response.data.data;
        setFormData({
          fullName: resData.fullName || "",
          email: resData.email || "",
          oldPassword: "",
          password: "",
          file: resData.image || null,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Admin Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedKey: string | null = null;

      // ✅ Upload file if new one is selected
      if (file) {
        uploadedKey = await uploadFile(file);
      }

      // ✅ Build payload
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
      };

      if (uploadedKey) {
        payload.image = uploadedKey; // send uploaded file key
      } else if (formData.file && typeof formData.file === "string") {
        payload.image = formData.file; // existing image
      }

      // ✅ Password update logic
      if (formData.oldPassword && formData.password) {
        payload.oldPassword = formData.oldPassword; // assuming confirm is old one (if you want separate field, adjust)
        payload.password = formData.password;
      }

      // ✅ Call API
      const response = await UpdateAdminData(
        `${ADMIN_URLS.UPDATE_ADMIN_DATA}`,
        payload,
      );

      if (response.status === 200) {
        toast.success("Details updated successfully!");
        getAdminData(); // refresh UI
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error while Updating");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch data on mount
  useEffect(() => {
    getAdminData();
  }, []);

  console.log(formData.file, "fileeeeee");
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full inline-flex flex-col justify-center items-start gap-10 p-5">
            <div className="self-stretch inline-flex flex-col justify-start items-start gap-5">
              {/* Image Section */}
              <div className="flex flex-col justify-start items-start gap-5">
                <img
                  className="w-80 h-96 rounded-[20px] object-cover"
                  src={
                    formData.file
                      ? formData.file.startsWith("blob:")
                        ? formData.file
                        : `${BASE_IMG_URL}${formData.file}`
                      : "https://placehold.co/347x417"
                  }
                  alt="Profile"
                />

                <div className="self-stretch inline-flex justify-start items-start gap-2.5">
                  <label className="flex-1 p-2.5 rounded-[50px] outline outline-offset-[-1px] outline-zinc-400 flex justify-center items-center gap-2.5 cursor-pointer">
                    <span className="text-center text-stone-200 text-xs font-normal ">
                      Upload / Change Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-[483px] flex flex-col justify-center items-start gap-5"
              >
                {/* Name */}
                <div className="self-stretch flex flex-col gap-1.5">
                  <label className="text-stone-200 text-xs font-light">
                    Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm"
                  />
                </div>

                {/* Email */}
                <div className="self-stretch flex flex-col gap-1.5">
                  <label className="text-stone-200 text-xs font-light">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm"
                  />
                </div>

                {/* Passwords */}
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  {/* Old Password */}
                  <div className="flex-1 flex flex-col gap-1.5 relative">
                    <label className="text-stone-200 text-xs font-light">
                      Old Password
                    </label>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      placeholder="*************"
                      className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((prev) => !prev)}
                      className="absolute right-3 top-9 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showOldPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="flex-1 flex flex-col gap-1.5 relative">
                    <label className="text-stone-200 text-xs font-light">
                      New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="*************"
                      className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-9 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="self-stretch">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold cursor-pointer"
                  >
                    {loading ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccountSettings;
