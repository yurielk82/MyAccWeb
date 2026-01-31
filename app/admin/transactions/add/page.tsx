"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI, usersAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateFee, formatCurrency } from "@/lib/utils";
import type { User, TransactionType } from "@/lib/types";

export default function AddTransactionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    managerEmail: "",
    type: "입금" as TransactionType,
    description: "",
    supplyAmount: "",
    vat: "",
    feeRate: "20",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.managerEmail || !formData.supplyAmount) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const supplyAmount = parseFloat(formData.supplyAmount);
    if (isNaN(supplyAmount) || supplyAmount <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await transactionsAPI.addTransaction({
        date: formData.date,
        managerEmail: formData.managerEmail,
        type: formData.type,
        description: formData.description || undefined,
        supplyAmount,
        vat: formData.vat ? parseFloat(formData.vat) : undefined,
        feeRate: formData.feeRate ? parseFloat(formData.feeRate) : undefined,
      });

      if (response.success) {
        alert("거래가 추가되었습니다.");
        router.push("/admin/transactions");
      } else {
        alert(response.error || "거래 추가에 실패했습니다.");
      }
    } catch (error) {
      alert("거래 추가 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 계산 결과
  const supplyAmount = parseFloat(formData.supplyAmount) || 0;
  const feeRate = parseFloat(formData.feeRate) || 0;
  const feeAmount = formData.type === "세금계산서" ? calculateFee(supplyAmount, feeRate) : 0;
  const depositAmount = formData.type === "세금계산서" ? supplyAmount - feeAmount : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <h1 className="text-xl font-bold">새 거래 추가</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 거래 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">거래 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 날짜 */}
              <div>
                <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1 block">
                  📅 날짜 <span className="text-danger">*</span>
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 담당자 */}
              <div>
                <label
                  htmlFor="managerEmail"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  👤 담당자 <span className="text-danger">*</span>
                </label>
                <select
                  id="managerEmail"
                  name="managerEmail"
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-base"
                  value={formData.managerEmail}
                  onChange={handleChange}
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

              {/* 구분 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  📝 구분 <span className="text-danger">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="입금"
                      checked={formData.type === "입금"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>입금</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="출금"
                      checked={formData.type === "출금"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>출금</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="세금계산서"
                      checked={formData.type === "세금계산서"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>세금계산서</span>
                  </label>
                </div>
              </div>

              {/* 공급가액 */}
              <div>
                <label
                  htmlFor="supplyAmount"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  💰 공급가액 (원) <span className="text-danger">*</span>
                </label>
                <Input
                  id="supplyAmount"
                  name="supplyAmount"
                  type="number"
                  placeholder="1000000"
                  value={formData.supplyAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                />
              </div>

              {/* 부가세 (세금계산서인 경우) */}
              {formData.type === "세금계산서" && (
                <div>
                  <label htmlFor="vat" className="text-sm font-medium text-gray-700 mb-1 block">
                    💵 부가세 (원)
                  </label>
                  <Input
                    id="vat"
                    name="vat"
                    type="number"
                    placeholder="100000"
                    value={formData.vat}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                </div>
              )}

              {/* 수수료율 (입금인 경우) */}
              {formData.type === "세금계산서" && (
                <div>
                  <label
                    htmlFor="feeRate"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    📊 수수료율 (%)
                  </label>
                  <Input
                    id="feeRate"
                    name="feeRate"
                    type="number"
                    placeholder="20"
                    value={formData.feeRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              )}

              {/* 메모 */}
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  📄 메모 (선택)
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full h-20 rounded-lg border border-gray-300 px-4 py-2 text-base resize-none"
                  placeholder="메모를 입력하세요"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* 계산 결과 (입금인 경우) */}
          {formData.type === "세금계산서" && supplyAmount > 0 && (
            <Card className="bg-primary-50 border-primary">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary mb-3">💡 계산 결과</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">수수료 ({feeRate}%)</span>
                    <span className="font-semibold text-danger">
                      -{formatCurrency(feeAmount)}원
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>입금액</span>
                    <span className="text-success">{formatCurrency(depositAmount)}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 버튼 */}
          <div className="space-y-3 pt-4">
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "저장 중..." : "저장하기 ✓"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => router.back()}
              disabled={loading}
            >
              취소
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
