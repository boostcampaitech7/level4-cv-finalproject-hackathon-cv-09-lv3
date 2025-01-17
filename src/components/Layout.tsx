// src/components/Layout.tsx
import React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비게이션바  */}
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-500">
            트래블로그
          </Link>
          <nav>
            <Link to="/storage" className="mr-4 text-gray-600 hover:text-brand-500 transition-colors">
              엽서 보관함
            </Link>
            {/* 다른 메뉴도 추가 여기서 */}
          </nav>
        </div>
      </header>

      {/* 실제 페이지 컨텐츠들 */}
      <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 py-6">
        {children}
      </main>

      {/* 푸터*/}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-screen-lg mx-auto px-4 py-3 text-sm text-gray-500">
          © 2025 트래블로그. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;
