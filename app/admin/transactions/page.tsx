"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { transactionsAPI, usersAPI } from "@/lib/supabase/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateTime,
  getTransactionTypeLabel,
  getTransactionTypeColor,
} from "@/lib/utils";
import type { Transaction, User } from "@/lib/supabase/client";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // URL 파라미터에서 담당자 필터 설정
  useEffect(() => {
    const managerParam = searchParams.get('manager');
    if (managerParam) {
      setSelectedManager(managerParam);
      setShowFilters(true); // 필터 영역 자동 표시
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedManager, selectedType, startDate, endDate]);

  useEffect(() => {
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
          t.manager_name?.toLowerCase().includes(query) ||
          t.manager_email.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.supply_amount.toString().includes(query)
      );
    }

    // 담당자 필터
    if (selectedManager !== "all") {
      filtered = filtered.filter((t) => t.manager_email === selectedManager);
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

  // CSV 내보내기 함수
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    // CSV 헤더
    const headers = [
      "날짜",
      "담당자",
      "이메일",
      "구분",
      "적요",
      "총액",
      "공급가액",
      "부가세",
      "수수료율(%)",
      "수수료",
      "입금액",
      "출금액",
      "잔액",
      "메모"
    ];

    // 데이터 행 생성
    const rows = filteredTransactions.map((t) => {
      const totalAmount = t.type === "세금계산서" && t.supply_amount && t.vat 
        ? t.supply_amount + t.vat 
        : "";
      
      return [
        t.date,
        t.manager_name || "",
        t.manager_email,
        t.type,
        t.description || "",
        totalAmount,
        t.supply_amount || "",
        t.vat || "",
        t.fee_rate ? (t.fee_rate * 100).toFixed(1) : "",
        t.fee_amount || "",
        t.deposit_amount || "",
        t.withdrawal || "",
        t.balance,
        t.memo || ""
      ];
    });

    // CSV 문자열 생성 (BOM 추가로 Excel에서 한글 정상 표시)
    const BOM = "\uFEFF";
    const csvContent = BOM + [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          // 셀에 쉼표나 줄바꾸이 있으면 큰따옴표로 감싸기
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes("\"")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
    ].join("\n");

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // 파일명 생성 (날짜 포함)
    const today = new Date().toISOString().split("T")[0];
    let filename = `거래내역_${today}`;
    
    // 필터 조건 파일명에 추가
    if (selectedManager !== "all") {
      const managerUser = users.find(u => u.email === selectedManager);
      if (managerUser) filename += `_${managerUser.name}`;
    }
    if (startDate) filename += `_${startDate}`;
    if (endDate) filename += `~${endDate}`;
    
    filename += ".csv";
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${filteredTransactions.length}건의 거래내역이 내보내기 되었습니다.\n파일명: ${filename}`);
  };

  // Excel 형식(XLSX) 내보내기 - 라이브러리 없이 간단한 HTML 테이블로 내보내기
  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    // HTML 테이블 생성
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>거래내역</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 5px; }
          th { background-color: #4472C4; color: white; font-weight: bold; }
          .number { text-align: right; mso-number-format:"#,##0"; }
          .date { mso-number-format:"yyyy-mm-dd"; }
          .percent { mso-number-format:"0.0%"; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>담당자</th>
              <th>이메일</th>
              <th>구분</th>
              <th>적요</th>
              <th>총액</th>
              <th>공급가액</th>
              <th>부가세</th>
              <th>수수료율(%)</th>
              <th>수수료</th>
              <th>입금액</th>
              <th>출금액</th>
              <th>잔액</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredTransactions.forEach((t) => {
      const totalAmount = t.type === "세금계산서" && t.supply_amount && t.vat 
        ? t.supply_amount + t.vat 
        : "";
      
      html += `
        <tr>
          <td class="date">${t.date}</td>
          <td>${t.manager_name || ""}</td>
          <td>${t.manager_email}</td>
          <td>${t.type}</td>
          <td>${t.description || ""}</td>
          <td class="number">${totalAmount}</td>
          <td class="number">${t.supply_amount || ""}</td>
          <td class="number">${t.vat || ""}</td>
          <td class="number">${t.fee_rate ? (t.fee_rate * 100).toFixed(1) : ""}</td>
          <td class="number">${t.fee_amount || ""}</td>
          <td class="number">${t.deposit_amount || ""}</td>
          <td class="number">${t.withdrawal || ""}</td>
          <td class="number">${t.balance}</td>
          <td>${t.memo || ""}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // 파일 다운로드
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // 파일명 생성
    const today = new Date().toISOString().split("T")[0];
    let filename = `거래내역_${today}`;
    
    if (selectedManager !== "all") {
      const managerUser = users.find(u => u.email === selectedManager);
      if (managerUser) filename += `_${managerUser.name}`;
    }
    if (startDate) filename += `_${startDate}`;
    if (endDate) filename += `~${endDate}`;
    
    filename += ".xls";
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${filteredTransactions.length}건의 거래내역이 Excel로 내보내기 되었습니다.\n파일명: ${filename}`);
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

  const hasMore = filteredTransactions.length > displayedTransactions.length;

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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 필터
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportToCSV}
              title="CSV 내보내기"
            >
              📄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportToExcel}
              title="Excel 내보내기"
            >
              📊
            </Button>
          </div>
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
                  <option value="입금">입금</option>
                  <option value="출금">출금</option>
                  <option value="세금계산서">세금계산서</option>
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

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={resetFilters}>
                필터 초기화
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={exportToCSV}>
                📄 CSV
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={exportToExcel}>
                📊 Excel
              </Button>
            </div>
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
                              {transaction.memo && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📄 {transaction.memo}
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
