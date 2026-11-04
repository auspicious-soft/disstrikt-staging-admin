import { formatName } from "@/lib/media";

// Job Junction labels shared by the admin and agent panels.
// Values are what the backend stores (note the agency userMode is "AGNECY").

export type JobOption = { label: string; value: string };

// Who a job is for (job.userMode): every app account type
export const JOB_USER_MODE_OPTIONS: JobOption[] = [
  { label: "Model", value: "MODEL" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "MUA/Hairstylist", value: "STYLIST" },
  { label: "Designer", value: "DESIGNER" },
  { label: "Brand", value: "BRAND" },
  { label: "Agency", value: "AGNECY" },
  { label: "Actor", value: "ACTOR" },
  { label: "Content Creator", value: "CREATOR" },
];

// The roles a job can be posted for, same as the app's post-job form
export const JOB_POST_USER_MODES = ["MODEL", "PHOTOGRAPHER", "STYLIST", "DESIGNER"];

// job.compensationType, labelled like the app
export const JOB_COMPENSATION_OPTIONS: JobOption[] = [
  { label: "Paid", value: "PAID" },
  { label: "TFP", value: "TFP" },
  { label: "Free Product", value: "FREE_PRODUCT" },
];

// Who posted it (job.postedBy). FOUNDER = posted from the admin panel.
export const JOB_POSTED_BY_OPTIONS: JobOption[] = [
  { label: "Agency", value: "AGENCIES" },
  { label: "Brand", value: "BRAND" },
  { label: "Designer", value: "DESIGNER" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "MUA/Hairstylist", value: "STYLIST" },
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

export const jobCompensationLabel = (value?: string | null) =>
  labelOf(JOB_COMPENSATION_OPTIONS, value);

// postedBy filter value for jobs posted by any app (Dome) user
export const DOME_POSTED_BY = "DOME";

// job.poster from the API: { type: "DISSTRIKT" } for admin-panel jobs,
// { type: "USER", fullName, image, userMode, studioName, logo } for app users,
// null when the poster's account was deleted
export type JobPoster = {
  type: "DISSTRIKT" | "USER";
  fullName?: string | null;
  image?: string | null;
  userMode?: string | null;
  studioName?: string | null;
  logo?: string | null;
} | null;

/** Studio name, else the user's name; "Distrikt" for admin-panel jobs. */
export const jobPosterName = (poster?: JobPoster) => {
  if (poster === null) return "Deleted account";
  if (!poster || poster.type === "DISSTRIKT") return "Distrikt";
  return poster.studioName || formatName(poster.fullName || "") || "N/A";
};

/** Studio logo, else the user's photo (null for Distrikt). */
export const jobPosterImage = (poster?: JobPoster) =>
  poster?.type === "USER" ? poster.logo || poster.image || null : null;
