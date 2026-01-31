"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI, usersAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateTime,
  getTransactionTypeLabel,
  getTransactionTypeColor,
} from "@/lib/utils";
import type { Transaction, User } from "@/lib/types";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedManager, selectedType, startDate, endDate]);

  useEffect(() => {
    // 페이징 적용
    const start = 0;
    const end = page * itemsPerPage;
    setDisplayedTransactions(filteredTransactions.slice(start, end));
  }, [filteredTransactions, page]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [transactionsRes, usersRes] = await Promise.all([
        transactionsAPI.getTransactions(user.email, "admin"),
        usersAPI.getUsers(),
      ]);

      if (transactionsRes.success && transactionsRes.data) {
        setTransactions(transactionsRes.data);
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

  const applyFilters = () => {
    let filtered = [...transactions];

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.managerName?.toLowerCase().includes(query) ||
          t.managerEmail.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.supplyAmount.toString().includes(query)
      );
    }

    // 담당자 필터
    if (selectedManager !== "all") {
      filtered = filtered.filter((t) => t.managerEmail === selectedManager);
    }

    // 구분 필터
    if (selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // 날짜 필터
    if (startDate) {
      filtered = filtered.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedManager("all");
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = filteredTransactions.length > displayedTransactions.length;

  const handleDelete = async (id: string) => {
    if (!confirm("이 거래를 삭제하시겠습니까?")) return;

    try {
      const response = await transactionsAPI.deleteTransaction(id);
      if (response.success) {
        alert("거래가 삭제되었습니다.");
        loadData();
      } else {
        alert(response.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  // 월별 그룹화
  const groupedTransactions = displayedTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              ←
            </Button>
            <h1 className="text-xl font-bold">거래내역</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 필터
          </Button>
        </div>

        {/* 검색바 */}
        <div className="px-4 pb-3">
          <Input
            placeholder="검색 (이름, 이메일, 금액...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 필터 영역 */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-3">
              {/* 담당자 필터 */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">담당자</label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                >
                  <option value="all">전체</option>
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 구분 필터 */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">구분</label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="deposit">입금</option>
                  <option value="withdraw">출금</option>
                  <option value="tax_invoice">세금계산서</option>
                </select>
              </div>
            </div>

            {/* 날짜 필터 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">시작일</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">종료일</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
              필터 초기화
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* 요약 정보 */}
        <div className="text-sm text-gray-600">
          {displayedTransactions.length} / {filteredTransactions.length}건 표시
          {filteredTransactions.length !== transactions.length &&
            ` (전체 ${transactions.length}건)`}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {searchQuery || selectedManager !== "all" || selectedType !== "all"
                ? "검색 결과가 없습니다."
                : "거래내역이 없습니다."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 거래내역 그룹 */
            {Object.entries(groupedTransactions).map(([month, monthTransactions]) => (
              <div key={month}>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 sticky top-[120px] bg-gray-50 py-2">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthTransactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">
                                📅 {formatDateTime(transaction.date)}
                              </p>
                              <p className="font-medium">
                                {transaction.managerName || transaction.managerEmail} |{" "}
                                <span className={getTransactionTypeColor(transaction.type)}>
                                  {getTransactionTypeLabel(transaction.type)}
                                </span>
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-gray-600">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/transactions/edit/${transaction.id}`
                                  )
                                }
                              >
                                📝
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(transaction.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          <hr />
                          <div className="space-y-1 text-sm">
                            {/* 세금계산서 */}
                            {transaction.type === "세금계산서" && (
                              <>
                                {transaction.supplyAmount > 0 && transaction.vat && transaction.vat > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">총액</span>
                                    <span className="font-medium">
                                      {formatCurrency(transaction.supplyAmount + transaction.vat)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.supplyAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">공급가액</span>
                                    <span className="font-medium">
                                      {formatCurrency(transaction.supplyAmount)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.vat && transaction.vat > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">부가세 (10%)</span>
                                    <span className="font-medium">
                                      {formatCurrency(transaction.vat)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.feeAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      수수료 ({(transaction.feeRate * 100).toFixed(0)}%)
                                    </span>
                                    <span className="font-medium text-danger">
                                      -{formatCurrency(transaction.feeAmount)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.depositAmount > 0 && (
                                  <div className="flex justify-between font-semibold text-success">
                                    <span>입금액</span>
                                    <span>
                                      +{formatCurrency(transaction.depositAmount)}원
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {/* 입금 */}
                            {transaction.type === "입금" && transaction.depositAmount > 0 && (
                              <div className="flex justify-between font-semibold text-success">
                                <span>입금액</span>
                                <span>
                                  +{formatCurrency(transaction.depositAmount)}원
                                </span>
                              </div>
                            )}
                            
                            {/* 출금 */}
                            {transaction.type === "출금" && transaction.withdrawal > 0 && (
                              <div className="flex justify-between font-semibold text-danger">
                                <span>출금액</span>
                                <span>
                                  -{formatCurrency(transaction.withdrawal)}원
                                </span>
                              </div>
                            )}
                            
                            <div className="flex justify-between font-semibold pt-1 border-t">
                              <span>잔액</span>
                              <span>{formatCurrency(transaction.balance)}원</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  더보기 ({displayedTransactions.length} / {filteredTransactions.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

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
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">💼</span>
            <span className="text-xs font-medium">거래</span>
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
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/settings")}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">설정</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-600 transition-colors"
        onClick={() => router.push("/admin/transactions/add")}
      >
        +
      </button>
    </div>
  );
}
