// src/components/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import Layout from "./Layout";
import "./LoginPage.css";
import { useToken } from "../context/TokenContext";

function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useToken(); // TokenContext에서 setToken 가져오기

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 구름, 비행기 애니메이션
    gsap.to(".cloud", {
      x: "100vw",
      repeat: -1,
      duration: 20,
      ease: "linear",
    });
    gsap.to(".plane", {
      x: "100vw",
      y: "-50vh",
      rotate: 15,
      repeat: -1,
      duration: 15,
      ease: "linear",
    });
  }, []);

  const handleLogin = async () => {
    setErrorMessage("");

    try {
      // 1) 이메일/비밀번호를 form-urlencoded로 전송
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(
        "https://9415-223-130-141-5.ngrok-free.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "로그인에 실패했습니다.");
      }

      // 2) 응답에서 access_token 추출
      const data = await response.json();
      const token = data.access_token;
      if (!token) {
        throw new Error("서버 응답에 access_token이 없습니다.");
      }

      // 3) setToken() -> Context state + localStorage 동시 업데이트
      setToken(token);

      alert("로그인 성공!");
      // 4) /storage로 이동
      navigate("/storage");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Layout>
      <div className="login-page">
        {/* 배경 애니메이션 */}
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="plane"></div>

        <div className="flex flex-col items-center justify-center h-[70vh] z-10 relative">
          <div className="w-full max-w-sm bg-white p-8 rounded-md shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
              트래블로그 로그인
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors w-full mt-4"
              >
                로그인
              </button>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;
