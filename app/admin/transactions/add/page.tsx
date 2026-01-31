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
    type: "세금계산서" as TransactionType,
    description: "",
    totalAmount: "", // 세금계산서: 총액 입력
    amount: "", // 입금/출금: 금액 입력
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

    if (!formData.managerEmail) {
      alert("담당자를 선택해주세요.");
      return;
    }

    if (formData.type === "세금계산서" && (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0)) {
      alert("올바른 총액을 입력해주세요.");
      return;
    }

    if ((formData.type === "입금" || formData.type === "출금") && (!formData.amount || parseFloat(formData.amount) <= 0)) {
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
        vat: vat > 0 ? vat : undefined,
        feeRate: feeRate > 0 ? feeRate : undefined,
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
  const feeRate = parseFloat(formData.feeRate) || 0;
  
  let vat = 0;
  let supplyAmount = 0;
  let feeAmount = 0;
  let depositAmount = 0;
  let withdrawalAmount = 0;

  if (formData.type === "세금계산서") {
    // 세금계산서: 총액 입력 → 부가세(10%) 계산 → 공급가액 계산 → 수수료 계산 → 입금액 계산
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    vat = Math.round(totalAmount / 11); // 부가세 10%
    supplyAmount = totalAmount - vat; // 공급가액
    feeAmount = Math.round(supplyAmount * (feeRate / 100)); // 수수료
    depositAmount = supplyAmount - feeAmount; // 최종 입금액
  } else if (formData.type === "입금") {
    // 입금: 금액 그대로
    depositAmount = parseFloat(formData.amount) || 0;
  } else if (formData.type === "출금") {
    // 출금: 금액 그대로
    withdrawalAmount = parseFloat(formData.amount) || 0;
  }

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
                      value="세금계산서"
                      checked={formData.type === "세금계산서"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>세금계산서</span>
                  </label>
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
                </div>
              </div>

              {/* 세금계산서: 총액 입력 */}
              {formData.type === "세금계산서" && (
                <>
                  <div>
                    <label
                      htmlFor="totalAmount"
                      className="text-sm font-medium text-gray-700 mb-1 block"
                    >
                      💰 총액 (공급가액+부가세) <span className="text-danger">*</span>
                    </label>
                    <Input
                      id="totalAmount"
                      name="totalAmount"
                      type="number"
                      placeholder="11000000"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      예: 11,000,000원 입력 시 → 공급가액 10,000,000원 + 부가세 1,000,000원
                    </p>
                  </div>

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
                </>
              )}

              {/* 입금/출금: 금액 입력 */}
              {(formData.type === "입금" || formData.type === "출금") && (
                <div>
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    💰 금액 (원) <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="1000000"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
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

          {/* 계산 결과 미리보기 */}
          {formData.type === "세금계산서" && parseFloat(formData.totalAmount) > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-600 mb-3">💡 계산 결과 미리보기</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">총액</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(formData.totalAmount))}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">공급가액</span>
                    <span className="font-medium">
                      {formatCurrency(supplyAmount)}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">부가세 (10%)</span>
                    <span className="font-medium">
                      {formatCurrency(vat)}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">수수료 ({feeRate}%)</span>
                    <span className="font-semibold text-danger">
                      -{formatCurrency(feeAmount)}원
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>최종 입금액</span>
                    <span className="text-success">+{formatCurrency(depositAmount)}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.type === "입금" && parseFloat(formData.amount) > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-green-600 mb-3">💡 입금 금액</p>
                  <div className="flex justify-between text-base font-bold">
                    <span>입금액</span>
                    <span className="text-success">+{formatCurrency(depositAmount)}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.type === "출금" && parseFloat(formData.amount) > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-red-600 mb-3">💡 출금 금액</p>
                  <div className="flex justify-between text-base font-bold">
                    <span>출금액</span>
                    <span className="text-danger">-{formatCurrency(withdrawalAmount)}원</span>
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
