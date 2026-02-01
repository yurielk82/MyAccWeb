"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authAPI } from "@/lib/supabase/api";
import { isValidEmail } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(email);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || "비밀번호 초기화에 실패했습니다.");
      }
    } catch (err) {
      setError("비밀번호 초기화 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              ←
            </Button>
          </div>
          <CardTitle>비밀번호 찾기</CardTitle>
          <CardDescription>
            {success
              ? "임시 비밀번호가 발급되었습니다"
              : "가입한 이메일을 입력하시면 임시 비밀번호를 발급해드립니다"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success-50 border border-success text-success">
                <p className="font-semibold mb-2">✓ 임시 비밀번호 발급 완료</p>
                <p className="text-sm">
                  임시 비밀번호가 <strong>{email}</strong>로 전송되었습니다.
                </p>
                <p className="text-sm mt-2">
                  임시 비밀번호: <strong>temp1234</strong>
                </p>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">다음 단계:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>임시 비밀번호로 로그인</li>
                  <li>설정에서 새 비밀번호로 변경</li>
                </ol>
              </div>

              <Button
                className="w-full"
                onClick={() => router.push("/login")}
              >
                로그인하러 가기 →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger-50 text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "처리 중..." : "임시 비밀번호 발급"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
