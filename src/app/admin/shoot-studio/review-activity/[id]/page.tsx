"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { NavArrowDownSolid } from "iconoir-react";
import { generateSignedUrlToUploadOn } from "@/actions";
import { useGetActivityById } from "@/hooks/useAdmin";
import { useReviewActivity } from "@/hooks/useAdmin";
import Loader from "@/app/admin/components/ui/Loader";

const labelClass = "text-xs font-normal text-stone-400";
const valueClass = "text-sm font-medium text-stone-100";
const controlClass =
  "h-11 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-500";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className={labelClass}>{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

const Panel = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between bg-white/10 px-4"
      >
        <h2 className="text-sm font-medium text-stone-100">{title}</h2>

        {collapsible && (
          <NavArrowDownSolid
            className={`h-4 w-4 text-stone-300 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && <div className="px-2 pt-3 pb-3">{children}</div>}
    </section>
  );
};

const SelectControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-normal text-stone-200">
      {label}
    </span>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} pr-9`}
      >
        <option className="bg-neutral-900">1 Star</option>
        <option className="bg-neutral-900">2 Stars</option>
        <option className="bg-neutral-900">3 Stars</option>
        <option className="bg-neutral-900">4 Stars</option>
        <option className="bg-neutral-900">5 Stars</option>
      </select>
      <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
    </div>
  </label>
);

const ReviewActivityPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isPending } = useGetActivityById({
    slotId: params.id,
    type: "Review",
  });
  const [wasPresent, setWasPresent] = useState<boolean | null>(null);
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const { mutateAsync: reviewActivity, isPending: isSaving } = useReviewActivity();

  const activity = useMemo(() => {
    if (Array.isArray(data)) return data[0] ?? {};
    return data ?? {};
  }, [data]);
  const user = activity.userId ?? activity.user ?? {};
  const shootDetails = activity.shootDetails ?? activity.details ?? {};
  const existingPictures = activity.images ?? activity.pictures ?? [];
  const addons = activity.addOnFeatures ?? shootDetails.addOnFeatures ?? [];

  const isPresent =
    wasPresent ??
    (activity.attended === "yes" || activity.attended === true || activity.attended == null);
  const initialRating = activity.rating ? `${activity.rating} Star${activity.rating === 1 ? "" : "s"}` : "";
  const initialComments = activity.comments ?? "";

  const formatValue = (value: unknown, fallback = "-") =>
    value === undefined || value === null || value === "" ? fallback : String(value);

  const getImageUrl = (image: string) => {
    if (/^(https?:|blob:|data:)/.test(image)) return image;
    const baseUrl = process.env.NEXT_PUBLIC_AWS_BUCKET_PATH ?? "";
    return `${baseUrl.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  };

  const getImageKey = (image: string) => {
    if (!image.startsWith("http")) return image;

    try {
      return decodeURIComponent(new URL(image).pathname).replace(/^\//, "");
    } catch {
      return image;
    }
  };

  const getImageValue = (image: unknown) => {
    if (typeof image === "string") return image;
    if (image && typeof image === "object") {
      const imageObject = image as { url?: unknown; path?: unknown; key?: unknown };
      return String(imageObject.url ?? imageObject.path ?? imageObject.key ?? "");
    }
    return "";
  };

  const uploadImage = async (file: File) => {
    const { signedUrl, key } = await generateSignedUrlToUploadOn(
      `${Date.now()}-${file.name}`,
      file.type,
    );
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) throw new Error("Image upload failed");
    return key;
  };

  const handleSave = async () => {
    const uploadedImages = await Promise.all(pictureFiles.map(uploadImage));
    await reviewActivity({
      slotId: params.id,
      attended: isPresent ? "yes" : "no",
      rating: isPresent
        ? Number((rating || initialRating).split(" ")[0]) || 0
        : 0,
      images: [
        ...existingPictures
          .map(getImageValue)
          .filter(Boolean)
          .map(getImageKey),
        ...uploadedImages,
      ],
      comments: isPresent ? comments || initialComments : "",
    });
    router.push("/admin/shoot-studio");
  };

  if (isPending) return <Loader />;

  return (
    <div className="w-full space-y-5 text-stone-100">
      <Panel title="Model Details" collapsible>
        <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2">
          <DetailItem label="Model Name" value={formatValue(user.fullName)} />
          <DetailItem label="Gender" value={formatValue(user.gender)} />
          <DetailItem label="Phone Number" value={formatValue(user.phoneNumber ?? user.phone)} />
          <DetailItem label="Email Address" value={formatValue(user.email)} />
        </div>
      </Panel>
      <Panel title="Shoot Details" collapsible>
        <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2 mb-2 md:mb-4">
          <DetailItem label="Shoot Goal" value={formatValue(activity.shootGoals ?? shootDetails.shootGoals)} />
          <DetailItem label="Shoot Format" value={formatValue(activity.shootFormat ?? shootDetails.shootFormat)} />

          <DetailItem label="Shoot Vibes" value={formatValue(activity.vibes ?? shootDetails.vibes)} />
          <DetailItem label="Outfit" value={formatValue(activity.canBringOutfits ?? shootDetails.canBringOutfits)} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <p className={labelClass}>Requested add ons</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-100">
            {Array.isArray(addons) && addons.length > 0 ? addons.map((addon: unknown, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-stone-400">•</span>
                <span>
                  {typeof addon === "string"
                    ? addon
                    : `${formatValue((addon as { key?: unknown }).key)}${
                        (addon as { value?: unknown }).value !== undefined
                          ? ` (Charges $${formatValue((addon as { value?: unknown }).value)})`
                          : ""
                      }`}
                </span>
              </div>
            )) : <span className="text-stone-400">-</span>}
          </div>
        </div>
      </Panel>

      <Panel title="More Information" collapsible>
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-normal text-white/60">
              Was Present?
            </p>
            <div className="flex flex-wrap gap-10">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-100">
                <input
                  type="radio"
                  name="presence"
                  checked={isPresent}
                  onChange={() => setWasPresent(true)}
                  className="h-3 w-3 accent-rose-500"
                />
                Yes, was present.
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-100">
                <input
                  type="radio"
                  name="presence"
                  checked={!isPresent}
                  onChange={() => setWasPresent(false)}
                  className="h-3 w-3 accent-rose-500"
                />
                No, did not show up
              </label>
            </div>
          </div>

          {isPresent && <div>
            <p className="mb-3 text-xs font-normal text-white/60">
              Upload Pictures
            </p>
            <div className="flex flex-wrap gap-2">
              {[...existingPictures, ...pictures].map((picture: string | { url?: string; path?: string }, item: number) => (
                <div
                  key={item}
                  className="relative h-28 w-32 overflow-hidden rounded-md border border-stone-600 bg-stone-900"
                >
                  <img
                    src={getImageUrl(getImageValue(picture))}
                    alt="Uploaded activity"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              <label className="flex h-28 w-32 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-700 bg-[#1A1A1ACC] text-[10px] font-normal text-stone-300 transition-colors hover:bg-white/10">
                <Plus className="h-3 w-3" />
                Add More
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setPictureFiles((current) => [...current, ...files]);
                    setPictures((current) => [
                      ...current,
                      ...files.map((file) => URL.createObjectURL(file)),
                    ]);
                  }}
                />
              </label>
            </div>
          </div>}
        </div>
      </Panel>

      <Panel title="Ratings & Review" collapsible>
        <div className="space-y-4">
          {isPresent && (
            <SelectControl
              label="Rate this activity"
              value={rating || initialRating}
              onChange={setRating}
            />
          )}

          {isPresent && <label className="block">
            <span className="mb-2 block text-xs font-normal text-stone-200">
              Comments
            </span>
            <div className="relative">
              <textarea
                placeholder="Add Comments"
                value={comments || initialComments}
                onChange={(event) => setComments(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-500"
              />
            </div>
          </label>}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
        <button
          type="button"
          onClick={() => router.push("/admin/shoot-studio")}
          className="h-11 rounded-md border border-stone-500 text-xs font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ReviewActivityPage;
