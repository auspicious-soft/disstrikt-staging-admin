import type { QueryClient } from "@tanstack/react-query";

type ChatPages<T> = { pages: ({ data?: T[] } | undefined)[]; pageParams: unknown[] };

/**
 * Puts a just-sent message at the top of the first (newest) page of a chat's
 * infinite query, so it shows without refetching the whole history. Skips it
 * if a poll already brought it in.
 */
export const prependToChatCache = <T extends { _id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  message: T,
) => {
  queryClient.setQueryData<ChatPages<T>>(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    const exists = old.pages.some((page) =>
      page?.data?.some((item) => item._id === message._id),
    );
    if (exists) return old;
    const [first, ...rest] = old.pages;
    return {
      ...old,
      pages: [{ ...first, data: [message, ...(first?.data ?? [])] }, ...rest],
    };
  });
};
