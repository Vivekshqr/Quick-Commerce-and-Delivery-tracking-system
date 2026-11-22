"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import { API_URL, getToken } from "@/lib/api";

const NotificationContext = createContext(null);
const STORAGE_KEY = "notifications";
const MAX_ITEMS = 30;

// Listens for "notification" socket events for the logged-in user, shows toasts,
// keeps a small history for the bell menu, and raises browser notifications.
export function NotificationProvider({ children }) {
  const pathname = usePathname();
  const [token, setToken] = useState(null);
  const [items, setItems] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState("default");
  const timers = useRef({});

  // Pick up login/logout (token changes) on navigation.
  useEffect(() => {
    setToken(getToken());
  }, [pathname]);

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
    else setPermission("unsupported");
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback((n) => {
    setItems((prev) => {
      const next = [{ ...n, read: false }, ...prev.filter((x) => x.id !== n.id)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setToasts((t) => [...t.slice(-3), n]);
    timers.current[n.id] = setTimeout(() => dismiss(n.id), 6000);

    // Browser notification when allowed (useful when the tab is in the background).
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
      try {
        const bn = new Notification(n.title, { body: n.message, tag: n.id, icon: "/favicon.ico" });
        bn.onclick = () => {
          window.focus();
          if (n.link) window.location.href = n.link;
        };
      } catch {
        /* some browsers only allow notifications from a service worker */
      }
    }
  }, [dismiss]);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token } });
    socket.on("notification", push);
    return () => socket.disconnect();
  }, [token, push]);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((x) => ({ ...x, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ items, toasts, unread: items.filter((x) => !x.read).length, permission, requestPermission, markAllRead, clearAll, dismiss, push }),
    [items, toasts, permission, requestPermission, markAllRead, clearAll, dismiss, push]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
