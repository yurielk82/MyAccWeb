"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI, usersAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime, getTransactionTypeLabel, getTransactionTypeColor } from "@/lib/utils";
import type { Transaction, User } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [transactionsRes, usersRes] = await Promise.all([
        transactionsAPI.getTransactions(user.email, "admin"),
        usersAPI.getUsers(),
      ]);

      if (transactionsRes.success && transactionsRes.data && usersRes.success && usersRes.data) {
        const allTxs: Transaction[] = transactionsRes.data as Transaction[];
        const users: User[] = usersRes.data as User[];

        setAllTransactions(allTxs); // 전체 데이터 저장
        setTransactions(allTxs.slice(0, 5)); // 최근 5개만 표시

        // 각 담당자별 최신 잔액 합계 계산
        let totalBal = 0;
        users.forEach((u) => {
          const managerTxs = allTxs
            .filter((t) => t.manager_email === u.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (managerTxs.length > 0) {
            totalBal += managerTxs[0].balance || 0;
          }
        });

        setTotalBalance(totalBal);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const todayTransactions = transactions.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.date.startsWith(today);
  });

  const todayTotal = todayTransactions.reduce((sum, t) => {
    if (t.type === "입금" || t.type === "세금계산서") {
      return sum + t.deposit_amount; // 입금액 사용
    } else if (t.type === "출금") {
      return sum - t.withdrawal; // 출금액 사용
    }
    return sum;
  }, 0);

  // 이번달 수수료 계산
  const now = new Date();
  const thisMonth = now.getMonth() + 1; // 1-12
  const thisYear = now.getFullYear();
  const monthlyFee = allTransactions.reduce((sum, t) => {
    const txDate = new Date(t.date);
    if (txDate.getMonth() + 1 === thisMonth && txDate.getFullYear() === thisYear) {
      return sum + (t.fee_amount || 0);
    }
    return sum;
  }, 0);

  // 올해 수수료 계산
  const yearlyFee = allTransactions.reduce((sum, t) => {
    const txDate = new Date(t.date);
    if (txDate.getFullYear() === thisYear) {
      return sum + (t.fee_amount || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">My Acc</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">👤 {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4 pb-20">
        {/* Balance Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">💰 전체 잔액 (모든 담당자)</p>
              <p className={`text-3xl font-bold ${
                totalBalance >= 0 ? "text-gray-900" : "text-red-600"
              }`}>
                {formatCurrency(totalBalance)}원
              </p>
              <p className={`text-sm ${
                todayTotal >= 0 ? "text-success" : "text-danger"
              }`}>
                {todayTotal >= 0 ? "↑" : "↓"} {todayTotal >= 0 ? "+" : ""}{formatCurrency(todayTotal)} (오늘)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600">{thisMonth}월</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(monthlyFee)}원
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600">{thisYear}년</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(yearlyFee)}원
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📋 최근 거래내역</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/transactions")}>
              전체보기
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                거래내역이 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500">
                            📅 {formatDateTime(transaction.date)}
                          </p>
                          <p className="font-medium">
                            {transaction.manager_name || transaction.manager_email} |{" "}
                            <span className={getTransactionTypeColor(transaction.type)}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </p>
                          {transaction.description && (
                            <p className="text-sm text-gray-600">
                              💬 {transaction.description}
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
                        
                        <div className="flex justify-between font-semibold">
                          <span>잔액</span>
                          <span className={transaction.balance >= 0 ? "" : "text-red-600"}>
                            {formatCurrency(transaction.balance)}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            ← 좌측 스와이프로 수정/삭제 가능
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-3">
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">홈</span>
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
