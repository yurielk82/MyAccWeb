"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mappingsAPI, usersAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Mapping, User } from "@/lib/supabase/client";

export default function AdminMappingsPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // 추가 폼 데이터
  const [addForm, setAddForm] = useState({
    vendor_name: "",
    manager_email: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mappingsRes, usersRes] = await Promise.all([
        mappingsAPI.getMappings(),
        usersAPI.getUsers(),
      ]);

      if (mappingsRes.success && mappingsRes.data) {
        setMappings(mappingsRes.data);
      }

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.vendor_name || !addForm.manager_email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setAdding(true);
    try {
      const selectedUser = users.find(u => u.email === addForm.manager_email);
      if (!selectedUser) {
        alert("선택한 담당자를 찾을 수 없습니다.");
        return;
      }

      const response = await mappingsAPI.addMapping({
        vendor_name: addForm.vendor_name,
        manager_name: selectedUser.name,
        manager_email: addForm.manager_email,
      });

      if (response.success) {
        alert("매핑이 추가되었습니다.");
        setAddForm({ vendor_name: "", manager_email: "" });
        setShowAddModal(false);
        loadData();
      } else {
        alert(response.error || "매핑 추가에 실패했습니다.");
      }
    } catch (error) {
      alert("매핑 추가 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 매핑을 삭제하시겠습니까?")) return;

    try {
      const response = await mappingsAPI.deleteMapping(id);
      if (response.success) {
        alert("매핑이 삭제되었습니다.");
        loadData();
      } else {
        alert(response.error || "매핑 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("매핑 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const filteredMappings = searchQuery
    ? mappings.filter(
        (m) =>
          m.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.manager_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.manager_email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mappings;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              ←
            </Button>
            <h1 className="text-xl font-bold">거래처 매핑</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            + 추가
          </Button>
        </div>

        {/* 검색바 */}
        <div className="px-4 pb-3">
          <Input
            placeholder="검색 (거래처명, 담당자...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* 안내 */}
        <Card className="bg-primary-50 border-primary">
          <CardContent className="pt-6">
            <p className="text-sm text-primary">
              💡 거래처를 담당자에게 자동으로 연결합니다
            </p>
          </CardContent>
        </Card>

        {/* 요약 */}
        <div className="text-sm text-gray-600">
          총 {filteredMappings.length}개 매핑
          {filteredMappings.length !== mappings.length && ` (전체 ${mappings.length}개)`}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : filteredMappings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {searchQuery ? "검색 결과가 없습니다." : "매핑이 없습니다."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMappings.map((mapping) => (
              <Card key={mapping.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-lg">🏢 {mapping.vendor_name}</p>
                      <div className="text-2xl text-gray-400 my-1">↓</div>
                      <p className="text-gray-700">👤 {mapping.manager_name}</p>
                      <p className="text-sm text-gray-500">📧 {mapping.manager_email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(mapping.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">매핑 추가</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  🏢 거래처명 <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="(주)에이스상사"
                  value={addForm.vendor_name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, vendor_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  👤 담당자 <span className="text-danger">*</span>
                </label>
                <select
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-base"
                  value={addForm.manager_email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, manager_email: e.target.value })
                  }
                  required
                >
                  <option value="">선택해주세요</option>
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? "추가 중..." : "추가하기"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
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
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/settings")}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">설정</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
