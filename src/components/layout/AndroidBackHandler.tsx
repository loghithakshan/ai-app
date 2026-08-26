"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function AndroidBackHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListener: { remove: () => void } | null = null;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");
        backListener = await App.addListener("backButton", ({ canGoBack }) => {
          if (pathname === "/" || pathname === "/dashboard") {
            App.exitApp();
          } else if (canGoBack) {
            router.back();
          } else {
            router.push("/dashboard");
          }
        });
      } catch {
        // Ignore if native plugin is uninstalled
      }
    };

    setup();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [router, pathname]);

  return null;
}
