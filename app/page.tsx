import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">💼</div>
        <h1 className="text-4xl font-bold text-gray-900">My Acc</h1>
        <p className="text-lg text-gray-600">간편한 장부 관리 시스템</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
