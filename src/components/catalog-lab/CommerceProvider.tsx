"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  createInitialCommerce,
  publicCommerce,
  selectionComponents,
  type PublicCommerce,
} from "@/lib/commerce/model";

import { useRouter } from "next/navigation";

const Context = createContext<PublicCommerce | null>(null);
export function CommerceProvider({
  initial,
  children,
}: {
  initial: PublicCommerce;
  children: ReactNode;
}) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initial);
  useEffect(() => {
    let disposed = false;
    let revision = initial.revision;
    const controller = new AbortController();
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/catalog-state", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: PublicCommerce = await response.json();
        if (!disposed && data.revision > revision) {
          revision = data.revision;
          setSnapshot(data);
          router.refresh();
        }
      } catch {
        /* Keep the last confirmed prices if connectivity drops. */
      }
    };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [initial.revision, router]);
  return (
    <Context value={initial.revision > snapshot.revision ? initial : snapshot}>
      {children}
    </Context>
  );
}
export function useCommerce() {
  const current = useContext(Context);
  return useMemo(() => {
    const data = current ?? publicCommerce(createInitialCommerce());
    return { ...data, components: selectionComponents(data) };
  }, [current]);
}
