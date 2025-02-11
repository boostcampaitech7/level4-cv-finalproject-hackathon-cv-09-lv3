// src/components/Layout.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from "../context/TokenContext";  // 예: 토큰 관리 훅

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { token, setToken } = useToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 로그아웃 처리
    setToken(null);
    navigate("/"); // 혹은 로그인 페이지로 이동
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비게이션바 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-500">
            트래블로그
          </Link>
          <nav className="flex items-center space-x-4">
            {token && (
              <Link
                to="/storage"
                className="text-gray-600 hover:text-brand-500 transition-colors"
              >
                엽서 보관함
              </Link>
            )}
            {/* 로그아웃 버튼: 토큰이 있으면 표시 */}
            {token && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                로그아웃
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 실제 페이지 컨텐츠 */}
      <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 py-6">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-screen-lg mx-auto px-4 py-3 text-sm text-gray-500">
          © 2025 트래블로그. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;
