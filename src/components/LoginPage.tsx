// src/components/LoginPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 실제 로그인 로직 (API, Auth 등)
    // 여기서는 단순히 엽서 보관함으로 이동하게 임시
    // 의찬이형 로그인 반영하기
    navigate("/storage");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-full max-w-sm bg-white p-8 rounded-md shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            트래블로그 로그인
          </h1>
          <div className="space-y-4">
          {/* 실제 로그인 폼 */}            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>

            <button
              onClick={handleLogin}
              className="btn-primary w-full mt-4"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;

