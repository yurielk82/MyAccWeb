"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { authAPI, usersAPI, settingsAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { User, Settings } from "@/lib/types";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // 비밀번호 변경
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, settingsRes] = await Promise.all([
        usersAPI.getUsers(),
        settingsAPI.getSettings(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await authAPI.changePassword(
        user!.email,
        passwordForm.oldPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        alert("비밀번호가 변경되었습니다.");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        alert(response.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <h1 className="text-xl font-bold">설정</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* 계정 정보 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">👤 계정 정보</h2>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setShowPasswordModal(true)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">비밀번호 변경</p>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 시스템 설정 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">💼 시스템 설정</h2>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">기본 수수료율</p>
                    <p className="font-medium">{settings?.defaultFeeRate || 20}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/admin/settings/users")}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">사용자 관리</p>
                    <p className="text-sm text-gray-500">{users.length}명</p>
                  </div>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/admin/mappings")}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">거래처 매핑 관리</p>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 앱 설정 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">🎨 앱 설정</h2>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">다크 모드</p>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only" />
                    <span className="absolute inset-0 bg-gray-300 rounded-full transition cursor-pointer"></span>
                  </label>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">알림</p>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only" />
                    <span className="absolute inset-0 bg-primary rounded-full transition cursor-pointer"></span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 정보 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">ℹ️ 정보</h2>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">버전</p>
                  <p className="text-gray-500">1.0.0</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 로그아웃 */}
        <Card className="border-danger cursor-pointer hover:bg-danger-50" onClick={handleLogout}>
          <CardContent className="p-4 text-center">
            <p className="font-semibold text-danger">🚪 로그아웃</p>
          </CardContent>
        </Card>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">비밀번호 변경</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  현재 비밀번호
                </label>
                <Input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  새 비밀번호
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">8자 이상, 영문과 숫자 포함</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  새 비밀번호 확인
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full" disabled={changingPassword}>
                  {changingPassword ? "변경 중..." : "변경하기"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-3">
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin")}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs">홈</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/transactions")}
          >
            <span className="text-2xl">💼</span>
            <span className="text-xs">거래</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/reports")}
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs">리포트</span>
          </button>
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-medium">설정</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
