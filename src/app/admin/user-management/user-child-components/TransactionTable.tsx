"use client"
import React, { ReactElement } from "react";
import DynamicTable from "../../../components/DynamicTable"; // Adjust the import path
import {  TableRow } from "@/types/interface-types";


interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}


interface TransactionTabProps {
  headers: TableHeader[];
  data: TableRow[];
  rowIcon?: string | React.ReactElement;
  onRowClick?: (id: string) => void;
}

const TransactionTab: React.FC<TransactionTabProps> = ({
  headers,
  data,
  rowIcon,
  onRowClick,
}) => {
  return (
    <div className="w-full flex flex-col gap-5">

      {/* Table */}
      <div className="rounded-[10px] flex flex-col outline outline-stone-700">
        <DynamicTable
          headers={headers}
          data={data}
          rowIcon={rowIcon}
          onclickFunction={onRowClick}
          isEyeShow={false}
        />
      </div>

      {/* Pagination */}
      <div className="w-full flex justify-between items-center">
        <div className="text-zinc-500 text-sm font-normal font-['Inter']">
          Page 1 of 10
        </div>
        <div className="flex gap-4">
          <button
            className="w-20 h-8 px-4 py-2 bg-neutral-800 rounded-md text-stone-200 text-xs font-medium font-['Inter']"
            disabled
          >
            Previous
          </button>
          <button className="w-20 h-8 px-4 py-2 bg-neutral-800 rounded-md text-stone-200 text-xs font-medium font-['Inter']">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTab;
