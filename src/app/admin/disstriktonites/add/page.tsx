"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCreateEmployee } from "@/hooks/useAdmin";
import DisstriktoniteForm from "../DisstriktoniteForm";

const AddDisstriktonitePage = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: createEmployee, isPending } = useCreateEmployee();

  return (
    <DisstriktoniteForm
      isPending={isPending}
      onSubmit={async (values) => {
        await createEmployee(values);
        await queryClient.invalidateQueries({ queryKey: ["employees"] });
      }}
    />
  );
};

export default AddDisstriktonitePage;
