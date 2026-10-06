"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Realtime chat for the admin and agent panels. The backend's Socket.IO
 * server (src/config/socket.ts) accepts the admin-panel token and sends the
 * panel new messages, read receipts and typing indicators for the chats the
 * account can see. REST polling stays on as a slower fallback.
 */
type SocketState = { socket: Socket | null; connected: boolean };

const SocketContext = createContext<SocketState>({ socket: null, connected: false });

// Online / last seen of app users ("user") and staff ("admin"), from
// presence:update events. Keyed "user:<id>" / "admin:<id>".
export type Presence = { online: boolean; lastSeenAt: string | null };
type PresenceMap = Record<string, Presence>;
const PresenceContext = createContext<PresenceMap>({});

// NEXT_PUBLIC_BACKEND_URL ends in /api; the socket server is at the origin
const socketUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  try {
    return new URL(base).origin;
  } catch {
    return base.replace(/\/api\/?$/, "");
  }
};

// Chat data that may have missed events while disconnected
const CHAT_QUERY_PARTS = ["modelChatMessages", "modelMarketProjectChat", "agentChats"];

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SocketState>({ socket: null, connected: false });
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(socketUrl(), { auth: { token } });
    let wasConnected = false;

    socket.on("connect", () => {
      setState({ socket, connected: true });
      // After a reconnect, catch up on anything sent while offline
      if (wasConnected) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.some((part) => CHAT_QUERY_PARTS.includes(String(part))),
        });
      }
      wasConnected = true;
    });
    socket.on("disconnect", () => {
      setState({ socket, connected: false });
      // Stale while offline; the API's values are used until events resume
      setPresence({});
    });
    socket.on(
      "presence:update",
      (event: { kind: string; id: string; online: boolean; lastSeenAt: string | null }) =>
        setPresence((current) => ({
          ...current,
          [`${event.kind}:${event.id}`]: { online: event.online, lastSeenAt: event.lastSeenAt },
        })),
    );
    setState({ socket, connected: false });

    return () => {
      socket.disconnect();
      setState({ socket: null, connected: false });
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={state}>
      <PresenceContext.Provider value={presence}>{children}</PresenceContext.Provider>
    </SocketContext.Provider>
  );
}

/**
 * Presence lookup: the latest socket event wins, otherwise the value the API
 * returned with the chat (`initial`).
 */
export const usePresenceLookup = () => {
  const presence = useContext(PresenceContext);
  return useCallback(
    (kind: "user" | "admin", id: string, initial?: Partial<Presence> | null): Presence =>
      presence[`${kind}:${id}`] ?? {
        online: Boolean(initial?.online),
        lastSeenAt: initial?.lastSeenAt ?? null,
      },
    [presence],
  );
};

/** "Online", "Last seen today at 14:05", "Last seen 3 Oct at 14:05" or "Offline". */
export const presenceLabel = (presence: Presence) => {
  if (presence.online) return "Online";
  if (!presence.lastSeenAt) return "Offline";
  const date = new Date(presence.lastSeenAt);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Last seen today at ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Last seen yesterday at ${time}`;
  return `Last seen ${date.toLocaleDateString([], { day: "numeric", month: "short" })} at ${time}`;
};

const toTime = (value?: string | null) => (value ? new Date(value).getTime() : 0);

/**
 * Tick for one of my messages: "read" (blue) once every other participant has
 * read it, "delivered" (double grey) once every one of them has been online
 * since it was sent, otherwise "sent" (single).
 */
export const tickStatus = (
  createdAt: string,
  others: { lastReadAt?: string | null; presence: Presence }[],
): "sent" | "delivered" | "read" => {
  if (!others.length) return "sent";
  const sentAt = toTime(createdAt);
  if (others.every((o) => toTime(o.lastReadAt) >= sentAt)) return "read";
  const delivered = others.every(
    (o) =>
      o.presence.online ||
      toTime(o.presence.lastSeenAt) >= sentAt ||
      toTime(o.lastReadAt) >= sentAt,
  );
  return delivered ? "delivered" : "sent";
};

export const useSocket = () => useContext(SocketContext);

/** Subscribes to a socket event while mounted; the latest handler is always used. */
export const useSocketEvent = <T = any,>(event: string, handler: (payload: T) => void) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;
    const listener = (payload: T) => handlerRef.current(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
};

const TYPING_TTL_MS = 6000;

/**
 * Who is typing, per conversation key. Entries expire on their own in case the
 * "stopped typing" event never arrives.
 */
export const useTypingUsers = () => {
  const [typing, setTyping] = useState<Record<string, Record<string, string>>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const update = useCallback(
    (key: string, who: string, name: string, isTyping: boolean) => {
      const timerKey = `${key}|${who}`;
      clearTimeout(timers.current[timerKey]);
      setTyping((current) => {
        const forKey = { ...(current[key] ?? {}) };
        if (isTyping) forKey[who] = name;
        else delete forKey[who];
        return { ...current, [key]: forKey };
      });
      if (isTyping) {
        timers.current[timerKey] = setTimeout(
          () => update(key, who, name, false),
          TYPING_TTL_MS,
        );
      }
    },
    [],
  );

  useEffect(() => {
    const all = timers.current;
    return () => Object.values(all).forEach(clearTimeout);
  }, []);

  const namesFor = useCallback(
    (key: string) => Object.values(typing[key] ?? {}).filter(Boolean),
    [typing],
  );

  return { update, namesFor };
};

export const typingLabel = (names: string[]) =>
  !names.length
    ? ""
    : names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : "Several people are typing...";

const TYPING_REPEAT_MS = 2500;
const TYPING_IDLE_MS = 3000;

/**
 * Sends "typing" while the user types: repeated every few seconds as they keep
 * typing, and "stopped" after a pause, on send and when the chat closes.
 */
export const useTypingEmitter = (emit: ((isTyping: boolean) => void) | null) => {
  const lastSent = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitRef = useRef(emit);
  emitRef.current = emit;

  const stop = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = null;
    if (lastSent.current) {
      lastSent.current = 0;
      emitRef.current?.(false);
    }
  }, []);

  const onType = useCallback(
    (text: string) => {
      if (!emitRef.current) return;
      if (!text.trim()) {
        stop();
        return;
      }
      const now = Date.now();
      if (now - lastSent.current > TYPING_REPEAT_MS) {
        lastSent.current = now;
        emitRef.current(true);
      }
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(stop, TYPING_IDLE_MS);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { onType, stop };
};
