import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AddTransactionRequest,
  UpdateTransactionRequest,
  Transaction,
  User,
  Mapping,
  AddMappingRequest,
  Settings,
  MonthlyReport,
  YearlyReport,
  ManagerReport,
} from "@/lib/types";

// 프록시 API 사용 (CORS 우회)
const USE_PROXY = true;
const API_URL = USE_PROXY ? "/api/gas" : process.env.NEXT_PUBLIC_GAS_API_URL || "";

// API 호출 헬퍼 함수
async function fetchAPI<T>(
  action: string,
  params: Record<string, any> = {},
  method: "GET" | "POST" = "GET"
): Promise<ApiResponse<T>> {
  try {
    let url = `${API_URL}?action=${action}`;
    let options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method === "GET") {
      // GET 요청: URL 파라미터로 추가
      Object.keys(params).forEach((key) => {
        url += `&${key}=${encodeURIComponent(params[key])}`;
      });
    } else {
      // POST 요청: body에 포함
      options.body = JSON.stringify({ action, ...params });
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 인증 API
export const authAPI = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return fetchAPI<LoginResponse>("login", credentials, "GET");
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return fetchAPI<User>("register", data, "POST");
  },

  // 비밀번호 변경
  changePassword: async (
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    return fetchAPI("changePassword", { email, oldPassword, newPassword }, "POST");
  },

  // 비밀번호 초기화
  resetPassword: async (email: string): Promise<ApiResponse> => {
    return fetchAPI("resetPassword", { email }, "POST");
  },
};

// 거래내역 API
export const transactionsAPI = {
  // 거래내역 조회
  getTransactions: async (
    email: string,
    role: "admin" | "user"
  ): Promise<ApiResponse<Transaction[]>> => {
    return fetchAPI<Transaction[]>("getTransactions", { email, role }, "GET");
  },

  // 거래 추가
  addTransaction: async (
    data: AddTransactionRequest
  ): Promise<ApiResponse<Transaction>> => {
    return fetchAPI<Transaction>("addTransaction", data, "POST");
  },

  // 거래 수정
  updateTransaction: async (
    data: UpdateTransactionRequest
  ): Promise<ApiResponse<Transaction>> => {
    return fetchAPI<Transaction>("updateTransaction", data, "POST");
  },

  // 거래 삭제
  deleteTransaction: async (id: string, requestUserEmail?: string): Promise<ApiResponse> => {
    return fetchAPI("deleteTransaction", { id, requestUserEmail }, "POST");
  },
};

// 사용자 API
export const usersAPI = {
  // 사용자 목록 조회 (관리자 전용)
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return fetchAPI<User[]>("getUsers", {}, "GET");
  },
};

// 매핑 API
export const mappingsAPI = {
  // 매핑 목록 조회
  getMappings: async (): Promise<ApiResponse<Mapping[]>> => {
    return fetchAPI<Mapping[]>("getMappings", {}, "GET");
  },

  // 매핑 추가
  addMapping: async (data: AddMappingRequest): Promise<ApiResponse<Mapping>> => {
    return fetchAPI<Mapping>("addMapping", data, "POST");
  },

  // 매핑 삭제
  deleteMapping: async (id: string): Promise<ApiResponse> => {
    return fetchAPI("deleteMapping", { id }, "POST");
  },
};

// 설정 API
export const settingsAPI = {
  // 설정 조회
  getSettings: async (): Promise<ApiResponse<Settings>> => {
    return fetchAPI<Settings>("getSettings", {}, "GET");
  },

  // 설정 업데이트 (확장 가능)
  updateSettings: async (data: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    return fetchAPI<Settings>("updateSettings", data, "POST");
  },
};

// 리포트 API
export const reportsAPI = {
  // 월별 리포트
  getMonthlyReport: async (year: number): Promise<ApiResponse<MonthlyReport[]>> => {
    return fetchAPI<MonthlyReport[]>("getReport", { type: "monthly", year }, "GET");
  },

  // 연별 리포트
  getYearlyReport: async (): Promise<ApiResponse<YearlyReport[]>> => {
    return fetchAPI<YearlyReport[]>("getReport", { type: "yearly" }, "GET");
  },

  // 담당자별 리포트
  getManagerReport: async (): Promise<ApiResponse<ManagerReport[]>> => {
    return fetchAPI<ManagerReport[]>("getReport", { type: "by_manager" }, "GET");
  },
};

// 국세청 메일 파싱 API (관리자 전용)
export const syncAPI = {
  syncTaxEmails: async (): Promise<ApiResponse> => {
    return fetchAPI("syncTaxEmails", {}, "POST");
  },
};
