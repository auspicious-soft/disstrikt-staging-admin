"use client";

// Profile of a non-model user (photographer, designer, stylist, agency, brand,
// actor, creator). Models open in Model Mansion instead.
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { Star } from "lucide-react";
import { useUserProfile } from "@/hooks/useAllUsers";
import SafeImage from "@/app/components/SafeImage";
import { formatName, resolveMediaUrl } from "@/lib/media";
import { jobUserModeLabel } from "@/lib/jobLabels";
import Loader from "../../components/ui/Loader";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const formatMoney = (amount?: number | null, currency?: string | null) =>
  amount == null
    ? "—"
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: (currency || "eur").toUpperCase(),
      }).format(amount);

// "BLACK_AND_WHITE" -> "Black And White"
const keyLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[12px] border border-[#2A2A2E] bg-[#151518] p-5">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-400">{title}</h2>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
    <div className="mt-0.5 break-words text-sm text-stone-200">{value || "—"}</div>
  </div>
);

const Chips = ({ items }: { items: string[] }) =>
  items.length ? (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-[#EF476F]/15 px-2.5 py-0.5 text-xs text-[#EF476F]">
          {item}
        </span>
      ))}
    </div>
  ) : null;

const Thumb = ({ src, alt }: { src: unknown; alt: string }) => (
  <SafeImage
    src={src}
    alt={alt}
    className="aspect-square w-full rounded-[8px] object-cover"
    placeholder={<div className="aspect-square w-full rounded-[8px] bg-[#1F1F23]" />}
  />
);

const ExternalLink = ({ href, label }: { href?: string | null; label: string }) =>
  href ? (
    <a
      href={/^https?:\/\//i.test(href) ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[#EF476F] hover:underline"
    >
      {label}
    </a>
  ) : null;

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useUserProfile(id);

  if (isPending) return <Loader />;
  if (isError || !data?.account) {
    return (
      <p className="mt-10 text-center text-[13px] text-stone-500">
        Couldn&apos;t load this user. Please try again.
      </p>
    );
  }

  const { account, info, studio } = data;
  const page = studio?.studio;
  const isModel = account.userMode === "MODEL";

  const tags: string[] = page
    ? [
        ...(page.categories ?? []),
        ...(page.photographyStyles ?? []).map(keyLabel),
        ...(page.agencyTypes ?? []).map(keyLabel),
        ...(page.beautyBranches ?? []).map(keyLabel),
      ]
    : account.agencyType
      ? [account.agencyType]
      : [];

  const socials = page?.socials ?? {};
  const links: { platform: string; url: string }[] = info?.links ?? [];

  return (
    <main className="w-full space-y-5 pb-10 text-stone-100">
      {/* Header card */}
      <section className="overflow-hidden rounded-[12px] border border-[#2A2A2E] bg-[#151518]">
        {page?.banner && (
          <SafeImage
            src={page.banner}
            alt=""
            className="h-40 w-full object-cover sm:h-52"
            placeholder={<div className="h-40 w-full bg-[#1F1F23] sm:h-52" />}
          />
        )}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <SafeImage
            src={page?.logo || account.image}
            alt={account.fullName}
            className="h-20 w-20 shrink-0 rounded-full border border-[#2A2A2E] object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">
              {page?.studioName ? page.studioName : formatName(account.fullName)}
            </h1>
            {page?.studioName && page.studioName !== account.fullName && (
              <div className="text-sm text-stone-400">{formatName(account.fullName)}</div>
            )}
            {page?.tagline && <p className="mt-1 text-sm text-stone-300">{page.tagline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-400">
              <span className="rounded-full bg-[#EF476F]/15 px-2.5 py-0.5 font-medium text-[#EF476F]">
                {account.userMode ? jobUserModeLabel(account.userMode) : "Type not set"}
              </span>
              {page?.isFeatured && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-amber-300">Featured</span>
              )}
              {page && page.rating?.count > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {page.rating.average} ({page.rating.count})
                </span>
              )}
              {(page?.city || page?.country || account.country) && (
                <span>{[page?.city, page?.country || account.country].filter(Boolean).join(", ")}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isModel && (
              <Link
                href={`/admin/model-mansion/${account._id}`}
                className="rounded-[6px] border border-[#2A2A2E] px-3 py-1.5 text-xs hover:border-[#EF476F]"
              >
                Model Mansion
              </Link>
            )}
            <Link
              href={`/admin/subscriptions/${account._id}`}
              className="rounded-[6px] border border-[#2A2A2E] px-3 py-1.5 text-xs hover:border-[#EF476F]"
            >
              Subscription
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Section title="Account">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Email" value={account.email} />
            <Field
              label="Phone"
              value={account.phone ? `${account.countryCode ?? ""} ${account.phone}`.trim() : null}
            />
            <Field label="Country" value={account.country} />
            <Field label="Language" value={account.language} />
            <Field label="Sign-in" value={account.authType} />
            <Field label="Email verified" value={account.isVerifiedEmail ? "Yes" : "No"} />
            <Field label="Payouts (Stripe)" value={account.stripeConnectAccountStatus?.replace(/_/g, " ")} />
            <Field label="Joined" value={formatDate(account.createdAt)} />
            <Field label="Last login" value={formatDate(account.lastLoginAt)} />
          </div>
        </Section>

        <div className="space-y-5 lg:col-span-2">
          <Section title="About">
            <p className="whitespace-pre-line text-sm text-stone-300">
              {page?.about || info?.aboutMe || "No description yet."}
            </p>
            {tags.length > 0 && (
              <div className="mt-4">
                <Chips items={tags} />
              </div>
            )}
            {(page?.address || info?.gender || info?.dob) && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {page?.address && <Field label="Address" value={page.address} />}
                {info?.gender && <Field label="Gender" value={info.gender} />}
                {info?.dob && <Field label="Date of birth" value={formatDate(info.dob)} />}
              </div>
            )}
            {(socials.instagram || socials.tiktok || socials.website || links.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-4">
                <ExternalLink href={socials.instagram} label="Instagram" />
                <ExternalLink href={socials.tiktok} label="TikTok" />
                <ExternalLink href={socials.website} label="Website" />
                {links.map((link) => (
                  <ExternalLink key={link.url} href={link.url} label={link.platform} />
                ))}
              </div>
            )}
          </Section>

          {studio?.counts && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Products", value: studio.counts.products, show: studio.features?.store },
                { label: "Services", value: studio.counts.services, show: studio.features?.services },
                { label: "Open jobs", value: studio.counts.openJobs, show: true },
                { label: "Models", value: studio.counts.models, show: studio.features?.models },
                { label: "Featured work", value: studio.counts.featuredWork, show: true },
              ]
                .filter((item) => item.show)
                .map((item) => (
                  <div key={item.label} className="rounded-[10px] border border-[#2A2A2E] bg-[#151518] p-3">
                    <div className="text-lg font-semibold">{item.value ?? 0}</div>
                    <div className="text-xs text-stone-400">{item.label}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {studio?.featuredWork?.length > 0 && (
        <Section title="Featured work">
          <div className="space-y-5">
            {studio.featuredWork.map((work: any) => (
              <div key={work._id}>
                <div className="mb-2 text-sm text-stone-200">{work.title}</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {(work.images ?? []).map((image: string, index: number) => (
                    <a key={index} href={resolveMediaUrl(image)} target="_blank" rel="noopener noreferrer">
                      <Thumb src={image} alt={work.title} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {info?.portfolioImages?.length > 0 && (
        <Section title="Photos">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {info.portfolioImages.map((image: string, index: number) => (
              <a key={index} href={resolveMediaUrl(image)} target="_blank" rel="noopener noreferrer">
                <Thumb src={image} alt="" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {info?.videos?.length > 0 && (
        <Section title="Videos">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {info.videos.map((video: any, index: number) => (
              <video
                key={index}
                src={resolveMediaUrl(video.url)}
                poster={resolveMediaUrl(video.thumbnail) || undefined}
                controls
                className="w-full rounded-[8px] bg-black"
              />
            ))}
          </div>
        </Section>
      )}

      {studio?.products?.length > 0 && (
        <Section title="Store (latest)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {studio.products.map((product: any) => (
              <div key={product._id}>
                <Thumb src={product.image} alt={product.name} />
                <div className="mt-1.5 truncate text-sm">{product.name}</div>
                <div className="text-xs text-stone-400">{formatMoney(product.price, product.currency)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {studio?.services?.length > 0 && (
        <Section title="Services">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {studio.services.map((service: any) => (
              <div key={service._id}>
                <Thumb src={service.image} alt={service.name} />
                <div className="mt-1.5 truncate text-sm">{service.name}</div>
                <div className="text-xs text-stone-400">
                  {service.startingFrom != null
                    ? `From ${formatMoney(service.startingFrom, service.currency)}`
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {studio?.models?.length > 0 && (
        <Section title="Agency models">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {studio.models.map((model: any) => {
              const card = (
                <>
                  <Thumb src={model.headshot} alt={model.modelName} />
                  <div className="mt-1.5 truncate text-sm">{formatName(model.modelName)}</div>
                  <div className="text-xs text-stone-400">
                    {model.type === "DISSTRIKT_MEMBER" ? "Disstrikt member" : "Roster model"}
                  </div>
                </>
              );
              return model.userId ? (
                <Link key={model.portfolioId ?? model.userId} href={`/admin/model-mansion/${model.userId}`}>
                  {card}
                </Link>
              ) : (
                <div key={model.portfolioId}>{card}</div>
              );
            })}
          </div>
        </Section>
      )}

      {studio?.jobs?.length > 0 && (
        <Section title="Open jobs">
          <div className="divide-y divide-[#2A2A2E]">
            {studio.jobs.map((job: any) => (
              <div key={job._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate">{job.title || "Untitled job"}</div>
                  <div className="text-xs text-stone-400">
                    For {jobUserModeLabel(job.lookingFor)} · {job.city || "—"} · ends {formatDate(job.endDate)}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-stone-400">{job.applicants} applicants</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {studio?.reviews?.latest?.length > 0 && (
        <Section title={`Reviews (${studio.reviews.summary?.count ?? 0})`}>
          <div className="divide-y divide-[#2A2A2E]">
            {studio.reviews.latest.map((review: any) => (
              <div key={review._id} className="py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </span>
                  <span className="text-stone-300">{formatName(review.reviewer?.fullName) || "Deleted account"}</span>
                  <span className="text-xs text-stone-500">{formatDate(review.createdAt)}</span>
                </div>
                {review.review && <p className="mt-1 text-stone-400">{review.review}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
