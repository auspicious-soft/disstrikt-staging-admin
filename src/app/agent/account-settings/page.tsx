"use client";

import React, { useState } from "react";

const fields = [
  { id: "name", label: "Name", type: "text", placeholder: "Name" },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Email Address",
  },
  {
    id: "newPassword",
    label: "New Password",
    type: "password",
    placeholder: "********",
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "********",
  },
];

const AccountSettings = () => {
  const [profileImage, setProfileImage] = useState("/assets/LoginImg.jpg");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <main className="w-full">
      <section className="flex w-full flex-col items-start gap-4">
        <div className="flex w-[300px] max-w-full flex-col gap-3">
          <img
            src={profileImage}
            alt="Profile"
            className="aspect-[4/4.75] w-full rounded-lg border border-black/70 object-cover grayscale"
          />

          <label className="flex h-8 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-600 bg-transparent px-4 text-xs font-normal text-stone-200 transition-colors hover:border-rose-400 hover:text-white">
            Upload / Change Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <form className="grid w-full grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.id}
                className="text-xs font-light text-stone-200"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className="h-11 w-full rounded-md border border-neutral-700 bg-transparent px-3 text-xs text-stone-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-rose-400"
              />
            </div>
          ))}

          <button
            type="submit"
            className="mt-2 h-11 w-full rounded-md bg-[#ff3f75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#e83267] md:col-span-2"
          >
            Confirm
          </button>
        </form>
      </section>
    </main>
  );
};

export default AccountSettings;
