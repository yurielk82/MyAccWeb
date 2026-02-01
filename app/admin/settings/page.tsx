"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { authAPI, usersAPI, settingsAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { User, Setting } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  // 비밀번호 변경
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // 사용자 관리 모달
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "user",
    fee_rate: "20",
  });
  const [savingUser, setSavingUser] = useState(false);

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

    if (passwordForm.newPassword.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await authAPI.changePassword(passwordForm.newPassword);

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

  // 사용자 추가 모달 열기
  const openAddUserModal = () => {
    setEditingUser(null);
    setUserForm({
      email: "",
      password: "",
      name: "",
      phone: "",
      role: "user",
      fee_rate: "20",
    });
    setShowUserModal(true);
  };

  // 사용자 수정 모달 열기
  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserForm({
      email: u.email,
      password: "",
      name: u.name,
      phone: u.phone || "",
      role: u.role,
      fee_rate: String((u.fee_rate || 0.2) * 100),
    });
    setShowUserModal(true);
  };

  // 사용자 저장 (추가/수정)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.name || !userForm.email) {
      alert("이름과 이메일은 필수입니다.");
      return;
    }

    if (!editingUser && !userForm.password) {
      alert("새 사용자는 비밀번호가 필수입니다.");
      return;
    }

    setSavingUser(true);
    try {
      let response;
      
      if (editingUser) {
        // 수정
        response = await usersAPI.updateUser({
          id: editingUser.id,
          email: userForm.email !== editingUser.email ? userForm.email : undefined,
          password: userForm.password || undefined,
          name: userForm.name,
          phone: userForm.phone || undefined,
          role: userForm.role,
          fee_rate: parseFloat(userForm.fee_rate) / 100,
        });
      } else {
        // 추가
        response = await usersAPI.addUser({
          email: userForm.email,
          password: userForm.password,
          name: userForm.name,
          phone: userForm.phone || undefined,
          role: userForm.role,
          fee_rate: parseFloat(userForm.fee_rate) / 100,
        });
      }

      if (response.success) {
        alert(editingUser ? "사용자가 수정되었습니다." : "사용자가 추가되었습니다.");
        setShowUserModal(false);
        loadData();
      } else {
        alert(response.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setSavingUser(false);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (u: User) => {
    if (u.role === 'admin') {
      alert("관리자는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`"${u.name}" 사용자를 삭제하시겠습니까?\n\n주의: 해당 사용자의 거래 내역은 유지됩니다.`)) {
      return;
    }

    try {
      const response = await usersAPI.deleteUser(u.id);
      if (response.success) {
        alert("사용자가 삭제되었습니다.");
        loadData();
      } else {
        alert(response.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error(error);
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

        {/* 사용자 관리 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-600">👥 사용자 관리 ({users.length}명)</h2>
            <Button size="sm" onClick={openAddUserModal}>+ 추가</Button>
          </div>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <p className="text-sm text-gray-500 text-center py-4">로딩 중...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">사용자가 없습니다.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((u) => (
                    <div key={u.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{u.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                            {u.role === 'admin' ? '관리자' : '사용자'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                          {u.last_transaction_date && (
                            <span>최근거래: {formatDate(u.last_transaction_date)}</span>
                          )}
                          {u.balance !== undefined && u.balance !== 0 && (
                            <span className={u.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              잔액: {formatCurrency(u.balance)}원
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditUserModal(u)}>
                          ✏️
                        </Button>
                        {u.role !== 'admin' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u)}>
                            🗑️
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                    <p className="font-medium">{(parseFloat(settings.find(s => s.key === 'default_fee_rate')?.value || '0.2') * 100).toFixed(0)}%</p>
                  </div>
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

        {/* 정보 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">ℹ️ 정보</h2>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">버전</p>
                  <p className="text-gray-500">2.0.0</p>
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
              <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(false)}>
                ✕
              </Button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
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
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">6자 이상</p>
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

      {/* User Add/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingUser ? "사용자 수정" : "사용자 추가"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowUserModal(false)}>
                ✕
              </Button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  비밀번호 {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUser ? "변경시에만 입력" : "비밀번호"}
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  전화번호
                </label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  역할
                </label>
                <select
                  className="w-full h-12 rounded-lg border border-gray-300 px-4"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="user">사용자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  수수료율 (%)
                </label>
                <Input
                  type="number"
                  value={userForm.fee_rate}
                  onChange={(e) => setUserForm({ ...userForm, fee_rate: e.target.value })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full" disabled={savingUser}>
                  {savingUser ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUserModal(false)}
                  disabled={savingUser}
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
            onClick={() => router.push("/admin/balances")}
          >
            <span className="text-2xl">👥</span>
            <span className="text-xs">잔액</span>
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
