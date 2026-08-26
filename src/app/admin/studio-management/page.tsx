"use client";

import React, { ReactElement, useEffect, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import CustomButton from "@/app/components/CustomButton";
import { Search, ChevronsUpDown, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useDeleteStudioById, useGetAllStudios } from "@/hooks/useAdmin";
import { Eye } from "iconoir-react";
import Loader from "../components/ui/Loader";

interface SelectOption {
  label: string;
  value: string;
}

interface StudioData {
  _id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  futureBookingCount: number;
}

interface TableRow {
  _id: string;
  id: number | string;
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

const CelebrationCruise: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studioToDelete, setStudioToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const debouncedSearch = useDebouncedValue(search, 500);
  const {
    data: studioResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetAllStudios({
    page,
    limit,
    debouncedSearch 
  });
  const {
    mutate: deleteStudio,
    isPending: deleteLoading,
  } = useDeleteStudioById();
  const studios: StudioData[] =
    studioResponse?.data?.data?.studios ??
    studioResponse?.data?.studios ??
    [];

  const pagination =
    studioResponse?.data?.data?.pagination ??
    studioResponse?.data?.pagination ??
    {};
  const headers: TableHeader[] = [
    {
      label: "Id",
      key: "id",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Studio Name",
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
      icon: <ChevronsUpDown className="w-4 h-4" />,
      align: "center",
      fontWeight: "font-medium",
    },
  ];
  const studioList: TableRow[] = studios.map(
    (studio: StudioData, index: number) => ({
      _id: studio._id,
      id: (page - 1) * limit + (index + 1),
      name: studio.name,
      location: studio.location,
      city: studio.city,
      country: studio.country,
      futureBookingCount: studio.futureBookingCount,
    })
  );
  const filteredStudios = studioList.filter((studio) => {
    if (!debouncedSearch) return true;
    const keyword = debouncedSearch.toLowerCase();
    return (
      String(studio.id).toLowerCase().includes(keyword) ||
      studio.name.toLowerCase().includes(keyword) ||
      studio.location.toLowerCase().includes(keyword) ||
      studio.city.toLowerCase().includes(keyword) ||
      studio.country.toLowerCase().includes(keyword)
    );
  });
  const totalPages =
    pagination?.totalPages ??
    Math.ceil((pagination?.total ?? 0) / limit) ??
    1;
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);
  useEffect(() => {
    if (isError) {
      toast.error("Error fetching studios");
    }
  }, [isError]);
  const openDeleteModal = (
    id: string,
    studioName: string
  ) => {
    setStudioToDelete({
      id,
      name: studioName,
    });

    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setShowDeleteModal(false);
    setStudioToDelete(null);
  };

  const confirmDeleteStudio = () => {
    if (!studioToDelete) return;

    deleteStudio(studioToDelete.id, {
      onSuccess: (response) => {
        if (
          response?.status === 200 ||
          response?.success
        ) {
          toast.success("Studio deleted successfully!");

          setShowDeleteModal(false);
          setStudioToDelete(null);
        } else {
          toast.error("Failed to delete studio");
        }
      },

      onError: (error) => {
        console.error("Error deleting studio:", error);
        toast.error("Error deleting studio");
      },
    });
  };

  const handleRouteWithId = (id: string) => {
    router.push(
      `/admin/studio-management/studio-details/${id}`
    );
  };
  const renderActions = (row: TableRow) => {
    return (
      <>
      <button
        type="button"
        onClick={() => router.push(`/admin/studio-management/${row._id}`)}
        className={`w-8 h-8 flex justify-center items-center bg-gray-600 rounded-md ${
          deleteLoading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-blue-600"
        }`}
      >
        <Eye className="w-4 h-4 text-white" />
      </button>
      <button
        type="button"
        onClick={() =>
          openDeleteModal(
            row._id,
            row.name
          )
        }
        disabled={deleteLoading}
        className={`w-8 h-8 flex justify-center items-center bg-rose-500 rounded-md ${
          deleteLoading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-rose-600"
        }`}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
      </>
    );
  };
  const baseSortOptions: SelectOption[] = [
    {
      label: "Likes (High → Low)",
      value: "highToLowLikes",
    },
    {
      label: "Likes (Low → High)",
      value: "lowToHighLikes",
    },
  ];

  return (
    <>
    {isFetching && !isLoading || deleteLoading ?
    <Loader/>
    :
    <>
      <div className="w-full inline-flex flex-col justify-center items-start gap-10">
        <div className="self-stretch flex flex-col justify-start items-end gap-4">

          {/* ================= SEARCH + BUTTONS ================= */}

          <div className="flex flex-wrap justify-end items-end gap-3 w-full">

            <div className="w-full sm:w-auto">
              <CustomInput
                placeholder="Search"
                icon={
                  <Search className="w-4 h-4" />
                }
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="w-full sm:w-auto max-w-full">
              <CustomButton
                label="+ Add New Studio"
                size="Medium"
                bgColor="bg-rose-500"
                textColor="text-white"
                onClick={() =>
                  router.push(
                    "/admin/studio-management/studio-details"
                  )
                }
              />
            </div>

            <div className="w-full sm:w-auto max-w-full">
              <CustomButton
                label="+ Manage Shoot Features"
                size="Medium"
                bgColor="bg-rose-500"
                textColor="text-white"
                onClick={() =>
                  router.push(
                    "/admin/studio-management/manage-shoot-features"
                  )
                }
              />
            </div>
          </div>
          <div className="w-full rounded-[10px]">
            <div className="w-full rounded-md outline outline-offset-[-1px] outline-stone-700">

              <DynamicTable
                headers={headers}
                data={filteredStudios}
                isEyeShow={false}
                renderActions={renderActions}
                showActionsHeaderLabel={true}
                onclickFunction={handleRouteWithId}
              />

            </div>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-zinc-900 rounded-[10px] outline outline-neutral-700 max-w-md w-full p-6 relative">

            {/* Close */}

            <button
              onClick={closeDeleteModal}
              disabled={deleteLoading}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}

            <div className="flex flex-col gap-4 mb-6">
              <h2 className="text-stone-200 text-xl font-semibold">
                Delete Studio
              </h2>
            </div>

            {/* Content */}

            <div className="mb-6">
              <p className="text-neutral-300 text-sm leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-stone-200">
                  "{studioToDelete?.name}"
                </span>
                ? This action cannot be undone and
                will permanently remove all associated
                data.
              </p>
            </div>

            {/* Buttons */}

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 px-5 py-3 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteStudio}
                disabled={deleteLoading}
                className="flex-1 px-5 py-3 bg-rose-500 rounded-[10px] text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
    }
    </>
  );
};

export default CelebrationCruise;