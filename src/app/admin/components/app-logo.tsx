"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../assets/images/Logo.png"

const AppLogo = () => {
  return (
    <div className="inline-block group-data-[collapsible=icon]:opacity-0">
      <Link href="/admin/dashboard" className="w-max block">
        <Image
          src={Logo}
          alt="Logo"
          width={0}
          height={0}
          sizes="100vw"
          className="h-18 w-26"
        />
      </Link>
    </div>
  );
};

export default AppLogo;
