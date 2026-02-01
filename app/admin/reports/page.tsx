"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { transactionsAPI } from "@/lib/supabase/api";
import type { Transaction } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MonthlyReport {
  month: string;
  total_fee: number;
  transaction_count: number;
}

interface YearlyReport {
  year: number;
  total_fee: number;
  transaction_count: number;
}

interface ManagerReport {
  manager_email: string;
  manager_name: string;
  total_fee: number;
  transaction_count: number;
}

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TabType = "monthly" | "yearly" | "manager";

export default function AdminReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyReport[]>([]);
  const [managerData, setManagerData] = useState<ManagerReport[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 거래 데이터를 가져와서 리포트 계산
      const response = await transactionsAPI.getTransactions(
        process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com",
        "admin"
      );

      if (response.success && response.data && Array.isArray(response.data)) {
        const transactions: Transaction[] = response.data as Transaction[];

        if (activeTab === "monthly") {
          // 월별 리포트 계산
          const monthlyMap = new Map<string, { total_fee: number; count: number }>();
          transactions.forEach((t) => {
            const date = new Date(t.date);
            if (date.getFullYear() === year) {
              const month = date.getMonth() + 1;
              const key = `${month}월`;
              const current = monthlyMap.get(key) || { total_fee: 0, count: 0 };
              monthlyMap.set(key, {
                total_fee: current.total_fee + (t.fee_amount || 0),
                count: current.count + 1,
              });
            }
          });

          const monthlyResult: MonthlyReport[] = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const key = `${month}월`;
            const data = monthlyMap.get(key) || { total_fee: 0, count: 0 };
            return {
              month: key,
              total_fee: data.total_fee,
              transaction_count: data.count,
            };
          });
          setMonthlyData(monthlyResult);
        } else if (activeTab === "yearly") {
          // 연별 리포트 계산
          const yearlyMap = new Map<number, { total_fee: number; count: number }>();
          transactions.forEach((t) => {
            const date = new Date(t.date);
            const txYear = date.getFullYear();
            const current = yearlyMap.get(txYear) || { total_fee: 0, count: 0 };
            yearlyMap.set(txYear, {
              total_fee: current.total_fee + (t.fee_amount || 0),
              count: current.count + 1,
            });
          });

          const yearlyResult: YearlyReport[] = Array.from(yearlyMap.entries())
            .map(([y, data]) => ({
              year: y,
              total_fee: data.total_fee,
              transaction_count: data.count,
            }))
            .sort((a, b) => b.year - a.year);
          setYearlyData(yearlyResult);
        } else if (activeTab === "manager") {
          // 담당자별 리포트 계산
          const managerMap = new Map<string, { name: string; total_fee: number; count: number }>();
          transactions.forEach((t) => {
            const email = t.manager_email;
            const current = managerMap.get(email) || {
              name: t.manager_name || email,
              total_fee: 0,
              count: 0,
            };
            managerMap.set(email, {
              name: current.name,
              total_fee: current.total_fee + (t.fee_amount || 0),
              count: current.count + 1,
            });
          });

          const managerResult: ManagerReport[] = Array.from(managerMap.entries())
            .map(([email, data]) => ({
              manager_email: email,
              manager_name: data.name,
              total_fee: data.total_fee,
              transaction_count: data.count,
            }))
            .sort((a, b) => b.total_fee - a.total_fee);
          setManagerData(managerResult);
        }
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <h1 className="text-xl font-bold">리포트</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "monthly"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            월별
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "yearly"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("yearly")}
          >
            연별
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "manager"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("manager")}
          >
            담당자별
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Year Selector (월별만) */}
        {activeTab === "monthly" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYear(year - 1)}
                >
                  ←
                </Button>
                <span className="text-lg font-bold">{year}년</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYear(year + 1)}
                  disabled={year >= new Date().getFullYear()}
                >
                  →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : (
          <>
            {/* 월별 리포트 */}
            {activeTab === "monthly" && (
              <>
                {/* 총계 */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-600">💰 연간 총 수수료</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(
                        monthlyData.reduce((sum, m) => sum + m.total_fee, 0)
                      )}
                      원
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      총 {monthlyData.reduce((sum, m) => sum + m.transaction_count, 0)}건
                    </p>
                  </CardContent>
                </Card>

                {/* 차트 */}
                {monthlyData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📈 월별 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" label={{ value: "월", position: "insideBottom", offset: -5 }} />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value) + "원"}
                          />
                          <Line
                            type="monotone"
                            dataKey="total_fee"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            name="수수료"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 상세 데이터 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 월별 상세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monthlyData.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">데이터가 없습니다.</p>
                    ) : (
                      <div className="space-y-2">
                        {monthlyData.map((item) => (
                          <div
                            key={item.month}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{item.month}월</p>
                              <p className="text-xs text-gray-500">
                                ({item.transaction_count}건)
                              </p>
                            </div>
                            <p className="font-bold text-primary">
                              {formatCurrency(item.total_fee)}원
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* 연별 리포트 */}
            {activeTab === "yearly" && (
              <>
                {/* 차트 */}
                {yearlyData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📊 연도별 비교</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={yearlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value) + "원"}
                          />
                          <Bar dataKey="total_fee" fill="#3B82F6" name="수수료" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 상세 데이터 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 연도별 상세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {yearlyData.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">데이터가 없습니다.</p>
                    ) : (
                      <div className="space-y-2">
                        {yearlyData.map((item) => (
                          <div
                            key={item.year}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-lg font-bold">{item.year}년</p>
                              <p className="text-sm text-gray-500">
                                ({item.transaction_count}건)
                              </p>
                            </div>
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(item.total_fee)}원
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* 담당자별 리포트 */}
            {activeTab === "manager" && (
              <>
                {/* 차트 */}
                {managerData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📊 담당자별 비율</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={managerData}
                            dataKey="total_fee"
                            nameKey="manager_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => entry.manager_name}
                          >
                            {managerData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value) + "원"}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 상세 데이터 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 담당자별 상세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {managerData.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">데이터가 없습니다.</p>
                    ) : (
                      <div className="space-y-2">
                        {managerData.map((item, index) => (
                          <div
                            key={item.manager_email}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div>
                                <p className="font-medium">{item.manager_name}</p>
                                <p className="text-xs text-gray-500">
                                  ({item.transaction_count}건)
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-primary">
                              {formatCurrency(item.total_fee)}원
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
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
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={() => router.push("/admin/balances")}
          >
            <span className="text-2xl">👥</span>
            <span className="text-xs">잔액</span>
          </button>
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium">리포트</span>
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
