"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "user") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "user") {
    return null;
  }

  return <>{children}</>;
}
