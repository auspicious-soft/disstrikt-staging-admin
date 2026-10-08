import { useEffect, useState } from "react";

export type CruiseStatus = "UPCOMING" | "ACTIVE" | "CLOSED";

/**
 * Same rule as the API (cruiseStatus): UPCOMING until the first slot starts,
 * ACTIVE until the last slot ends, CLOSED (past) after. Worked out here too so
 * an open page flips status at the exact start and end, without a reload.
 */
export const liveCruiseStatus = (
  event: { status?: string; startDateTime?: string; endDateTime?: string } | undefined,
  now: number,
): CruiseStatus | undefined => {
  const start = event?.startDateTime ? new Date(event.startDateTime).getTime() : NaN;
  const end = event?.endDateTime ? new Date(event.endDateTime).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return event?.status as CruiseStatus | undefined;
  }
  if (end < now) return "CLOSED";
  if (start <= now) return "ACTIVE";
  return "UPCOMING";
};

// The current time, updated every `intervalMs`
export const useNow = (intervalMs = 1000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
};
