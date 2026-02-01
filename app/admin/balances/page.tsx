"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI, usersAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, User } from "@/lib/supabase/client";

interface ManagerBalance {
  manager_email: string;
  manager_name: string;
  balance: number;
  transactionCount: number;
  lastTransactionDate: string;
}

export default function ManagerBalancesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [balances, setBalances] = useState<ManagerBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [transactionsRes, usersRes] = await Promise.all([
        transactionsAPI.getTransactions(user.email, "admin"),
        usersAPI.getUsers(),
      ]);

      if (transactionsRes.success && transactionsRes.data && usersRes.success && usersRes.data) {
        const transactions: Transaction[] = transactionsRes.data as Transaction[];
        const users: User[] = usersRes.data as User[];

        // 담당자별 최신 잔액 계산
        const balanceMap = new Map<string, ManagerBalance>();

        // 각 담당자의 가장 최근 거래에서 잔액 가져오기
        users.forEach((u) => {
          const managerTransactions = transactions
            .filter((t) => t.manager_email === u.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (managerTransactions.length > 0) {
            const latest = managerTransactions[0];
            balanceMap.set(u.email, {
              manager_email: u.email,
              manager_name: u.name,
              balance: latest.balance || 0,
              transactionCount: managerTransactions.length,
              lastTransactionDate: latest.date,
            });
          } else {
            balanceMap.set(u.email, {
              manager_email: u.email,
              manager_name: u.name,
              balance: 0,
              transactionCount: 0,
              lastTransactionDate: "",
            });
          }
        });

        const balanceList = Array.from(balanceMap.values()).sort(
          (a, b) => b.balance - a.balance
        );
        setBalances(balanceList);
      }
    } catch (error) {
      console.error("Failed to load balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              ←
            </Button>
            <h1 className="text-xl font-bold">담당자별 잔액</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* 총 잔액 */}
        <Card className={`bg-gradient-to-br ${
          totalBalance >= 0 
            ? "from-blue-500 to-blue-600" 
            : "from-red-500 to-red-600"
        } text-white`}>
          <CardContent className="p-6">
            <p className="text-sm opacity-90">총 잔액</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(totalBalance)}원</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : balances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              담당자 정보가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {balances.map((balance) => (
              <Card
                key={balance.manager_email}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(
                    `/admin/transactions?manager=${balance.manager_email}`
                  )
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{balance.manager_name}</p>
                      <p className="text-sm text-gray-500">{balance.manager_email}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        <span>거래 {balance.transactionCount}건</span>
                        {balance.lastTransactionDate && (
                          <span>
                            최근:{" "}
                            {new Date(balance.lastTransactionDate).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          balance.balance >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {formatCurrency(balance.balance)}원
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/transactions")}
          >
            <span className="text-2xl">💼</span>
            <span className="text-xs">거래</span>
          </button>
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">👥</span>
            <span className="text-xs font-medium">잔액</span>
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
