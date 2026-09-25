"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import dummyUserImg from "@/assets/images/dummyUserImg.png";
import { mediaCandidates } from "@/lib/media";

type Props = {
  // Stored value(s): S3 key, full URL, or { url, thumbnail }; first match wins
  src: unknown;
  alt: string;
  className?: string;
  // Shown when nothing loads. Defaults to the person placeholder image.
  placeholder?: ReactNode;
};

/** <img> that tries each candidate URL in turn, then falls back. */
const SafeImage = ({ src, alt, className = "", placeholder }: Props) => {
  const candidates = useMemo(() => mediaCandidates(src), [src]);
  const signature = candidates.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [signature]);

  if (index >= candidates.length) {
    return placeholder !== undefined ? (
      <>{placeholder}</>
    ) : (
      <img src={dummyUserImg.src} alt={alt} className={className} />
    );
  }

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      onError={() => setIndex((current) => current + 1)}
    />
  );
};

export default SafeImage;
