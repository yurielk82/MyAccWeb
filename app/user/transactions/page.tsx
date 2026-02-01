"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateTime,
  getTransactionTypeLabel,
  getTransactionTypeColor,
} from "@/lib/utils";
import type { Transaction } from "@/lib/supabase/client";

export default function UserTransactionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, startDate, endDate]);

  useEffect(() => {
    const start = 0;
    const end = page * itemsPerPage;
    setDisplayedTransactions(filteredTransactions.slice(start, end));
  }, [filteredTransactions, page]);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await transactionsAPI.getTransactions(user.email, "user");
      if (response.success && response.data) {
        const userTransactions = (response.data as Transaction[]).filter(
          (t) => t.manager_email === user.email
        );
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
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
          t.description?.toLowerCase().includes(query) ||
          t.supply_amount.toString().includes(query)
      );
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
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
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
            <h1 className="text-xl font-bold">내 거래내역</h1>
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
            placeholder="검색 (메모, 금액...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 필터 영역 */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3 border-t pt-3">
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
              {searchQuery || startDate || endDate
                ? "검색 결과가 없습니다."
                : "거래내역이 없습니다."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
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
                                <span className={getTransactionTypeColor(transaction.type)}>
                                  {getTransactionTypeLabel(transaction.type)}
                                </span>
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  💬 {transaction.description}
                                </p>
                              )}
                              {transaction.memo && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📄 {transaction.memo}
                                </p>
                              )}
                            </div>
                          </div>
                          <hr />
                          <div className="space-y-1 text-sm">
                            {/* 세금계산서 */}
                            {transaction.type === "세금계산서" && (
                              <>
                                {transaction.supply_amount > 0 && transaction.vat && transaction.vat > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">총액</span>
                                    <span className="font-medium">
                                      {formatCurrency(transaction.supply_amount + transaction.vat)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.supply_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">공급가액</span>
                                    <span className="font-medium">
                                      {formatCurrency(transaction.supply_amount)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.vat && transaction.vat > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">부가세 (10%)</span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(transaction.vat)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.fee_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      수수료 ({(transaction.fee_rate * 100).toFixed(0)}%)
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(transaction.fee_amount)}원
                                    </span>
                                  </div>
                                )}
                                {transaction.deposit_amount > 0 && (
                                  <div className="flex justify-between font-semibold text-success">
                                    <span>입금액</span>
                                    <span>
                                      +{formatCurrency(transaction.deposit_amount)}원
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {/* 입금 */}
                            {transaction.type === "입금" && transaction.deposit_amount > 0 && (
                              <div className="flex justify-between font-semibold text-success">
                                <span>입금액</span>
                                <span>
                                  +{formatCurrency(transaction.deposit_amount)}원
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
                              <span className={transaction.balance >= 0 ? "text-gray-900" : "text-red-600"}>
                                {formatCurrency(transaction.balance)}원
                              </span>
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
            {filteredTransactions.length > displayedTransactions.length && (
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
            onClick={() => router.push("/user")}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs">홈</span>
          </button>
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">📋</span>
            <span className="text-xs font-medium">내역</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/user/settings")}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">설정</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
