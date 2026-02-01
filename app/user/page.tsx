"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime, getTransactionTypeLabel, getTransactionTypeColor } from "@/lib/utils";
import type { Transaction } from "@/lib/supabase/client";

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [thisMonthDeposit, setThisMonthDeposit] = useState(0);
  const [thisMonthWithdrawal, setThisMonthWithdrawal] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await transactionsAPI.getTransactions(user.email, "user");
      if (response.success && response.data) {
        const userTransactions = response.data.filter(
          (t) => t.manager_email === user.email
        );
        setTransactions(userTransactions.slice(0, 10)); // 최근 10개
        
        if (userTransactions.length > 0) {
          setBalance(userTransactions[0].balance);
        }

        // 이번 달 입금/출금 계산
        const now = new Date();
        const thisMonth = userTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        });

        const deposit = thisMonth.reduce((sum, t) => {
          if (t.type === "입금" || t.type === "세금계산서") {
            return sum + (t.deposit_amount || 0);
          }
          return sum;
        }, 0);

        const withdrawal = thisMonth.reduce((sum, t) => {
          if (t.type === "출금") {
            return sum + (t.withdrawal || 0);
          }
          return sum;
        }, 0);

        setThisMonthDeposit(deposit);
        setThisMonthWithdrawal(withdrawal);
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

  const thisMonthFee = transactions
    .filter((t) => {
      const now = new Date();
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear() &&
        t.fee_amount
      );
    })
    .reduce((sum, t) => sum + (t.fee_amount || 0), 0);

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
        {/* Greeting */}
        <Card className="bg-gradient-to-br from-primary to-primary-600 text-white">
          <CardContent className="pt-6">
            <p className="text-lg">👋 안녕하세요, {user?.name}님!</p>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">💰 내 잔액</p>
              <p className={`text-3xl font-bold ${
                balance >= 0 ? "text-gray-900" : "text-red-600"
              }`}>
                {formatCurrency(balance)}원
              </p>
              <p className="text-sm text-gray-600">
                이번 달 입금 +{formatCurrency(thisMonthDeposit)}원 / 출금 -{formatCurrency(thisMonthWithdrawal)}원
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600">입금</p>
              <p className="text-2xl font-bold text-success">
                +{formatCurrency(thisMonthDeposit)}원
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600">출금</p>
              <p className="text-2xl font-bold text-danger">
                -{formatCurrency(thisMonthWithdrawal)}원
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📋 내 거래내역</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/user/transactions")}
            >
              전체
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
                            <span className={getTransactionTypeColor(transaction.type)}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </p>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-1">
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
            onClick={() => router.push("/user/transactions")}
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs">내역</span>
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
