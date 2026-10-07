"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEmployeesById, useUpdateEmployeeById } from "@/hooks/useAdmin";
import Loader from "../../components/ui/Loader";
import DisstriktoniteForm, { EMPTY_DISSTRIKTONITE } from "../DisstriktoniteForm";

const EditDisstriktonitePage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetEmployeesById(id);
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployeeById(id);

  // Full-page loader only while the employee loads, never while saving
  if (isLoading || !data) return <Loader />;

  const code = String(data.countryCode ?? "").trim();
  const initialValues = {
    ...EMPTY_DISSTRIKTONITE,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    language: Array.isArray(data.language)
      ? data.language
      : data.language
        ? [data.language]
        : [],
    countryCode: code ? `+${code.replace(/^\+/, "")}` : EMPTY_DISSTRIKTONITE.countryCode,
    phone: String(data.phone ?? "").replace(/\D/g, ""),
    roleId: data.roleId ?? "",
  };

  return (
    <DisstriktoniteForm
      // Fill the form once per employee; a background refetch won't wipe edits
      key={data._id ?? id}
      isEdit
      initialValues={initialValues}
      isPending={isPending}
      onSubmit={async ({ password, ...values }) => {
        await updateEmployee({ ...values, ...(password ? { password } : {}) });
        await queryClient.invalidateQueries({ queryKey: ["employees"] });
        await queryClient.invalidateQueries({ queryKey: ["employeById", id] });
      }}
    />
  );
};

export default EditDisstriktonitePage;
