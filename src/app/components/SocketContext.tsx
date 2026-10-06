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
    socket.on("disconnect", () => setState({ socket, connected: false }));
    setState({ socket, connected: false });

    return () => {
      socket.disconnect();
      setState({ socket: null, connected: false });
    };
  }, [queryClient]);

  return <SocketContext.Provider value={state}>{children}</SocketContext.Provider>;
}

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
