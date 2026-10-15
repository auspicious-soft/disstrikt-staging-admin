// Job Junction labels shared by the admin and agent panels.
// Values are what the backend stores (note the agency userMode is "AGNECY").

export type JobOption = { label: string; value: string };

// Who a job is for (job.userMode): every app account type
export const JOB_USER_MODE_OPTIONS: JobOption[] = [
  { label: "Model", value: "MODEL" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "Beauty Professional", value: "STYLIST" },
  { label: "Designer", value: "DESIGNER" },
  { label: "Brand", value: "BRAND" },
  { label: "Agency", value: "AGNECY" },
  { label: "Actor", value: "ACTOR" },
  { label: "Content Creator", value: "CREATOR" },
];

// Who posted it (job.postedBy). FOUNDER = posted from the admin panel.
export const JOB_POSTED_BY_OPTIONS: JobOption[] = [
  { label: "Agency", value: "AGENCIES" },
  { label: "Brand", value: "BRAND" },
  { label: "Designer", value: "DESIGNER" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "Beauty Professional", value: "STYLIST" },
  { label: "Distrikt", value: "FOUNDER" },
];

const labelOf = (options: JobOption[], value?: string | null) => {
  if (!value) return "N/A";
  const upper = String(value).toUpperCase();
  return (
    options.find((option) => option.value === upper)?.label ??
    upper
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export const jobUserModeLabel = (value?: string | null) =>
  labelOf(JOB_USER_MODE_OPTIONS, value);

export const jobPostedByLabel = (value?: string | null) =>
  labelOf(JOB_POSTED_BY_OPTIONS, value);
