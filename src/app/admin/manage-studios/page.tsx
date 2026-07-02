"use client";

import React, { ReactElement, useEffect, useState } from "react";
import Loader from "../components/ui/Loader";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import CustomButton from "@/app/components/CustomButton";
import { Eye, ChevronsUpDown, Search, Trash2, X } from "lucide-react";
import CustomInput from "@/app/components/CustomInput";
import { TableRow } from "@/types/interface-types";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { getAllStudios, deleteStudio } from "@/services/admin-services";
import { toast } from "sonner";

interface StudioData {
  _id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  futureBookingCount: number;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

const StudioListing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [studioList, setStudioList] = useState<TableRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studioToDelete, setStudioToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  const headers: TableHeader[] = [
    {
      label: "Id",
      key: "id",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Studio",
      key: "name",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Location",
      key: "city",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Upcoming Activities",
      key: "futureBookingCount",
      align: "center",
      fontWeight: "font-medium",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/manage-studios/${_id}`);
  };

  const openDeleteModal = (_id: string, studioName: string) => {
    setStudioToDelete({ id: _id, name: studioName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudioToDelete(null);
  };

  const confirmDeleteStudio = async () => {
    if (!studioToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await deleteStudio(
        `${ADMIN_URLS.DELETE_STUDIO}?id=${studioToDelete.id}`,
      );

      if (response.status === 200 || response.success) {
        toast.success("Studio deleted successfully!");
        closeDeleteModal();
        // Refresh the studio list
        await fetchAllStudios(false);
      } else {
        toast.error("Failed to delete studio");
      }
    } catch (error) {
      console.error("Error deleting studio:", error);
      toast.error("Error deleting studio");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderActions = (row: TableRow) => {
    return (
      <button
        onClick={() => openDeleteModal(row._id, row.name as string)}
        disabled={deleteLoading}
        className={`w-8 h-8 flex justify-center items-center bg-rose-500 rounded-md ${
          deleteLoading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-rose-600"
        }`}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
    );
  };

  const fetchAllStudios = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const URL = `${ADMIN_URLS.GET_STUDIOS}?page=${page}&limit=${limit}`;

      const response = await getAllStudios(`${URL}`);
      if (response.status === 200) {
        const resData = response?.data?.data?.studios;
        const paginationData = response?.data?.data?.pagination;
        const mappedStudios: TableRow[] = resData.map(
          (std: StudioData, idx: number) => ({
            _id: std._id,
            id: (page - 1) * limit + (idx + 1),
            name: std.name,
            location: std.location,
            country: std.country,
            city: std.city,
            futureBookingCount: std.futureBookingCount,
          }),
        );

        setStudioList(mappedStudios);
        setTotalPages(paginationData.totalPages);
      } else {
        toast.error("Error fetching studios");
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudios(true);
  }, [page, limit]);

  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full inline-flex flex-col justify-center items-start gap-10">
            <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
              <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full max-w-full">
                <div className="w-full sm:w-auto max-w-full">
                  <CustomButton
                    label="Add A New Studio"
                    size="Medium"
                    bgColor="bg-rose-500"
                    textColor="text-white"
                    onClick={() =>
                      router.push("/admin/manage-studios/add-studio")
                    }
                  />
                </div>
                <div className="w-full sm:w-auto max-w-full">
                  <CustomButton
                    label="Manage Shoot Features"
                    size="Medium"
                    bgColor="bg-rose-500"
                    textColor="text-white"
                    onClick={() =>
                      router.push("/admin/manage-studios/studio-features")
                    }
                  />
                </div>
              </div>
              <div className="self-stretch rounded-[10px] flex flex-col justify-start items-start">
                <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700 flex flex-col justify-start items-start">
                  <DynamicTable
                    headers={headers}
                    data={studioList}
                    rowIcon={eyeimg.src}
                    onclickFunction={handleRouteWithId}
                    renderActions={renderActions}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 rounded-[10px] outline outline-neutral-700 max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="flex flex-col gap-4 mb-6">
                  <h2 className="text-stone-200 text-xl font-semibold ">
                    Delete Studio
                  </h2>
                </div>

                {/* Modal Content */}
                <div className="mb-6">
                  <p className="text-neutral-300 text-sm  leading-relaxed">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-stone-200">
                      "{studioToDelete?.name}"
                    </span>
                    ? This action cannot be undone and will permanently remove
                    all associated data.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="flex-1 px-5 py-3 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-semibold  hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteStudio}
                    disabled={deleteLoading}
                    className="flex-1 px-5 py-3 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2  cursor-pointer"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Delete Studio"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StudioListing;
