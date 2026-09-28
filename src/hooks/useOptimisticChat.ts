import { useCallback, useEffect, useRef, useState } from "react";

export type ChatSendPayload =
  | { content: string }
  | { type: "image"; mediaUrl: string; content?: string };

export type PendingChatMessage = {
  tempId: string;
  content: string;
  // Local preview while a photo uploads
  imageUrl?: string;
  status: "sending" | "failed";
  createdAt: string;
};

type Job = {
  content: string;
  file?: File;
  // Set once the photo is uploaded, so a retry doesn't upload it again
  mediaUrl?: string;
};

/**
 * Shows a message the moment it's sent (status "sending"), then removes it
 * once the server confirms; the send call itself adds the saved message to the
 * chat cache, which shows it with a tick. Messages go out one at a time, in
 * the order they were typed. A failed one stays as "failed" with a retry.
 */
export const useOptimisticChat = ({
  send,
  uploadImage,
}: {
  send: (payload: ChatSendPayload) => Promise<unknown>;
  uploadImage?: (file: File) => Promise<string>;
}) => {
  const [pending, setPending] = useState<PendingChatMessage[]>([]);
  const jobs = useRef(new Map<string, Job>());
  const queue = useRef<Promise<void>>(Promise.resolve());

  // Free local photo previews still on screen when the chat closes
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(
    () => () => {
      pendingRef.current.forEach((m) => m.imageUrl && URL.revokeObjectURL(m.imageUrl));
    },
    [],
  );

  const setStatus = (tempId: string, status: PendingChatMessage["status"]) =>
    setPending((list) => list.map((m) => (m.tempId === tempId ? { ...m, status } : m)));

  const run = useCallback(
    (tempId: string) => {
      queue.current = queue.current.then(async () => {
        const job = jobs.current.get(tempId);
        if (!job) return;
        try {
          if (job.file && !job.mediaUrl) {
            if (!uploadImage) throw new Error("Uploads are not supported here");
            job.mediaUrl = await uploadImage(job.file);
          }
          await send(
            job.mediaUrl
              ? { type: "image", mediaUrl: job.mediaUrl, ...(job.content ? { content: job.content } : {}) }
              : { content: job.content },
          );
          jobs.current.delete(tempId);
          setPending((list) => {
            const done = list.find((m) => m.tempId === tempId);
            if (done?.imageUrl) URL.revokeObjectURL(done.imageUrl);
            return list.filter((m) => m.tempId !== tempId);
          });
        } catch {
          setStatus(tempId, "failed");
        }
      });
    },
    [send, uploadImage],
  );

  const enqueue = useCallback(
    (job: Job) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      jobs.current.set(tempId, job);
      setPending((list) => [
        ...list,
        {
          tempId,
          content: job.content,
          imageUrl: job.file ? URL.createObjectURL(job.file) : undefined,
          status: "sending",
          createdAt: new Date().toISOString(),
        },
      ]);
      run(tempId);
    },
    [run],
  );

  const sendText = useCallback((content: string) => enqueue({ content }), [enqueue]);

  const sendImage = useCallback(
    (file: File, caption: string) => enqueue({ content: caption, file }),
    [enqueue],
  );

  const retry = useCallback(
    (tempId: string) => {
      setStatus(tempId, "sending");
      run(tempId);
    },
    [run],
  );

  return { pending, sendText, sendImage, retry };
};
