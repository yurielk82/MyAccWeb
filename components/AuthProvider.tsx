"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // localStorage 복구 대기
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isHydrated) return;

    const publicPaths = ["/", "/login", "/register", "/forgot-password"];
    const isPublicPath = publicPaths.includes(pathname);

    // 인증 필요한 페이지인데 로그인 안 됨
    if (!isPublicPath && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // 이미 로그인된 사용자가 로그인 페이지 접근
    if (pathname === "/login" && isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    }
  }, [isHydrated, isAuthenticated, user, pathname, router]);

  // localStorage 복구 전에는 로딩 표시
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
