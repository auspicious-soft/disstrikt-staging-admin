"use client";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { CreateEmployeeByAdmin } from "@/services/admin-services";
import React, { useState } from "react";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import { Eye, EyeOff } from "lucide-react";

function CreateEmployee({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error("Please enter a valid email address");
    return false;
  }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!formData.country.trim()) {
      toast.error("Country is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return; // Stop if validation fails

    setLoading(true);
    try {
      const response = await CreateEmployeeByAdmin(
        `${ADMIN_URLS.CREATE_EMPLOYEE}`,
        formData
      );

      if (response.status === 201) {
        setFormData({
          fullName: "",
          email: "",
          password: "",
          country: "",
        });
        toast.success("Employee Created Successfully.");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error Creaing Employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full max-w-2xl mx-auto mt-6 bg-neutral-900 p-6 rounded-2xl shadow-md text-white">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Create Employee
            </h2>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-stone-200">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-stone-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label className="block mb-1 text-sm text-stone-200">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 pr-10 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Country */}
           <div className="mb-4">
  <label className="block mb-1 text-sm text-stone-200">
    Country
  </label>
  <select
    name="country"
    value={formData.country}
    onChange={handleSelectChange}
    className="w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-rose-500"
  >
    {/* Show placeholder only if no country selected */}
    {!formData.country && (
      <option value="" disabled hidden>
        Select
      </option>
    )}
    <option value="UK">United Kingdom</option>
    <option value="FR">France</option>
    <option value="BL">Belgium</option>
    <option value="ES">Spain</option>
    <option value="NL">Netherlands</option>
  </select>
</div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-rose-500 hover:bg-rose-600 transition-all text-white font-medium py-2 px-4 rounded-full cursor-pointer"
            >
              Save
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default CreateEmployee;
