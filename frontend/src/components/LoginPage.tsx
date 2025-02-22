// src/components/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import Layout from "./Layout";
import "./LoginPage.css";
import { useToken } from "../context/TokenContext";

function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useToken();

  // 로그인/회원가입에 쓰일 상태들
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");          // 회원가입 시 필요한 name
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

  // 실제 로그인(기존 로직)
  const handleLogin = async () => {
    setErrorMessage("");

    try {
      // 1) 이메일/비밀번호를 form-urlencoded로 전송 (register:false)
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      // name, register 파라미터는 로그인만 할 때는 굳이 안 보냄

      const response = await fetch(
        "https://375c-223-130-141-5.ngrok-free.app/api/auth/login",
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

  // 새로 추가한 "회원가입" 로직
  const handleRegister = async () => {
    setErrorMessage("");

    try {
      // 회원가입은 같은 엔드포인트에 register=true와 name 파라미터도 함께 전송
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("register", "true");

      const response = await fetch(
        "https://375c-223-130-141-5.ngrok-free.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "회원가입/로그인에 실패했습니다.");
      }

      const data = await response.json();
      const token = data.access_token;
      if (!token) {
        throw new Error("서버 응답에 access_token이 없습니다.");
      }

      // 가입 후 바로 로그인 처리
      setToken(token);

      alert("회원가입 및 로그인 성공!");
      navigate("/storage");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Layout>
      {/* 배경 애니메이션 */}
      <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="plane"></div>

        {/* 로그인 카드 */}
        <div className="relative w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-xl z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
            로그인
          </h1>

          {/* 입력 필드 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
                placeholder="●●●●●●●"
              />
            </div>

            {/* 회원가입 시 필요한 이름 */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                이름 (회원가입 시 필수)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
                placeholder="홍길동"
              />
            </div> */}

            {/* 에러 메시지 */}
            {errorMessage && (
              <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
            )}

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
              로그인
            </button>

            {/* 추가된 회원가입 버튼 */}
            <button
              onClick={handleRegister}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
              회원가입
            </button>
          </div>

          {/* 아래는 “계정이 없으신가요? 회원가입” 문구 삭제 처리 */}
          {/* 
          <p className="mt-4 text-sm text-center text-gray-600">
            계정이 없으신가요?
            <a href="/register" className="text-blue-500 hover:underline">
              회원가입
            </a>
          </p>
          */}
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;


// // src/components/LoginPage.tsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { gsap } from "gsap";
// import Layout from "./Layout";
// import "./LoginPage.css";
// import { useToken } from "../context/TokenContext";

// function LoginPage() {
//   const navigate = useNavigate();
//   const { setToken } = useToken(); // TokenContext에서 setToken 가져오기

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     // 구름, 비행기 애니메이션
//     gsap.to(".cloud", {
//       x: "100vw",
//       repeat: -1,
//       duration: 20,
//       ease: "linear",
//     });
//     gsap.to(".plane", {
//       x: "100vw",
//       y: "-50vh",
//       rotate: 15,
//       repeat: -1,
//       duration: 15,
//       ease: "linear",
//     });
//   }, []);

//   const handleLogin = async () => {
//     setErrorMessage("");

//     try {
//       // 1) 이메일/비밀번호를 form-urlencoded로 전송
//       const formData = new URLSearchParams();
//       formData.append("email", email);
//       formData.append("password", password);

//       const response = await fetch(
//         "https://e429-223-130-141-5.ngrok-free.app/api/auth/login",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//           body: formData.toString(),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || "로그인에 실패했습니다.");
//       }

//       // 2) 응답에서 access_token 추출
//       const data = await response.json();
//       const token = data.access_token;
//       if (!token) {
//         throw new Error("서버 응답에 access_token이 없습니다.");
//       }

//       // 3) setToken() -> Context state + localStorage 동시 업데이트
//       setToken(token);

//       alert("로그인 성공!");
//       // 4) /storage로 이동
//       navigate("/storage");
//     } catch (error: any) {
//       setErrorMessage(error.message);
//     }
//   };

//   return (
//     <Layout>
//       {/* 배경 애니메이션 */}
//       <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen flex items-center justify-center overflow-hidden">
//         <div className="cloud cloud1"></div>
//         <div className="cloud cloud2"></div>
//         <div className="plane"></div>

//         {/* 로그인 카드 */}
//         <div className="relative w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-xl z-10">
//           <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
//             로그인
//           </h1>

//           {/* 입력 필드 */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 이메일
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
//                 placeholder="email@example.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 비밀번호
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
//                 placeholder="●●●●●●●"
//               />
//             </div>

//             {/* 에러 메시지 */}
//             {errorMessage && (
//               <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
//             )}

//             {/* 로그인 버튼 */}
//             <button
//               onClick={handleLogin}
//               className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md mt-4"
//             >
//               로그인
//             </button>
//           </div>

//           {/* 추가 링크 */}
//           <p className="mt-4 text-sm text-center text-gray-600">
//             계정이 없으신가요?{" "}
//             <a
//               href="/register"
//               className="text-blue-500 hover:underline transition duration-200"
//             >
//               회원가입
//             </a>
//           </p>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default LoginPage;