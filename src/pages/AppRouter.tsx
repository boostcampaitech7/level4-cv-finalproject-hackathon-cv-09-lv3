// /data/ephemeral/home/travelog/src/pages/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useToken } from "../context/TokenContext";

import LoginPage from "../components/LoginPage";
import PostcardStorage from "../components/PostcardStorage";
import PostcardDetail from "../components/PostcardDetail";
import PostcardEdit from "../components/PostcardEdit";
import PhotoUpload from "../components/PhotoUpload";
import PhotoDescription from "../components/PhotoDescription";
import LoadingBlogCreation from "../components/LoadingBlogCreation";
import PostcardSelection from "../components/PostcardSelection";
import BlogContentPage from "../components/BlogContentPage";
import StampChecker from "../components/StampChecker"; // 추가된 StampChecker

/**
 * AppRouter:
 * 1) 비로그인 상태: '/' → LoginPage, 그 외 → 로그인 페이지로 리다이렉트
 * 2) 로그인 상태: '/' → '/storage'
 *    - '/storage' → 엽서(프로젝트) 보관함
 *    - '/postcard/:id' → 엽서 상세
 *    - '/postcard/:id/edit' → 엽서 수정
 *    - '/upload' → 사진 업로드
 *    - '/description' → 사진 설명 입력
 *    - '/loading' → AI 처리 중 화면
 *    - '/postcard-selection' → 엽서 후보 선택
 *    - '/stamp-checker' → 스탬프 확인
 *    - '/blog-content' → 블로그 내용 편집
 */

function AppRouter() {
  const { token } = useToken();
  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/storage" replace />} />
      <Route path="/storage" element={<PostcardStorage />} />
      <Route path="/postcard/:id" element={<PostcardDetail />} />
      <Route path="/postcard/:id/edit" element={<PostcardEdit />} />
      <Route path="/upload" element={<PhotoUpload />} />
      <Route path="/description" element={<PhotoDescription />} />
      <Route path="/loading" element={<LoadingBlogCreation />} />
      <Route path="/postcard-selection" element={<PostcardSelection />} />
      <Route path="/stamp-checker" element={<StampChecker />} />
      <Route path="/blog-content" element={<BlogContentPage />} />
      <Route path="*" element={<Navigate to="/storage" replace />} />
    </Routes>
  );
}

export default AppRouter;



// // src/pages/AppRouter.tsx
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useToken } from "../context/TokenContext";

// import LoginPage from "../components/LoginPage";
// import PostcardStorage from "../components/PostcardStorage";
// import PostcardDetail from "../components/PostcardDetail";
// import PostcardEdit from "../components/PostcardEdit";
// import PhotoUpload from "../components/PhotoUpload";
// import PhotoDescription from "../components/PhotoDescription";
// import LoadingBlogCreation from "../components/LoadingBlogCreation";
// import PostcardSelection from "../components/PostcardSelection";
// import BlogContentPage from "../components/BlogContentPage";

// /**
//  * AppRouter:
//  * 1) 로그인 안 된 상태(token 없으면): 
//  *    - '/' → LoginPage
//  *    - 그 외 경로 → 로그인으로 리다이렉트
//  *
//  * 2) 로그인 된 상태(token 존재):
//  *    - '/' → '/storage'
//  *    - '/storage' → 엽서(프로젝트) 보관함
//  *    - '/postcard/:id' → 엽서 상세
//  *    - '/postcard/:id/edit' → 엽서 수정
//  *    - '/upload' → 사진 업로드 (새 프로젝트 생성)
//  *    - '/description' → 사진별 설명 입력
//  *    - '/loading' → AI 처리 중 화면
//  *    - '/postcard-selection' → 생성된 엽서 후보 선택
//  *    - '/blog-content' → 최종 블로그 내용 편집
//  */

// function AppRouter() {
//   const { token } = useToken(); // TokenContext에서 토큰 가져옴

//   // 1) 비로그인 상태: LoginPage만 허용
//   if (!token) {
//     return (
//       <Routes>
//         {/* 로그인 페이지 */}
//         <Route path="/" element={<LoginPage />} />
//         {/* 토큰 없는 상태에서 다른 경로 접근 -> 로그인 페이지로 */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   // 2) 로그인된 상태
//   return (
//     <Routes>
//       {/* 루트 '/' -> '/storage'로 이동 */}
//       <Route path="/" element={<Navigate to="/storage" replace />} />
      
//       {/* 엽서(프로젝트) 관리 */}
//       <Route path="/storage" element={<PostcardStorage />} />
//       <Route path="/postcard/:id" element={<PostcardDetail />} />
//       <Route path="/postcard/:id/edit" element={<PostcardEdit />} />

//       {/* 사진 업로드 -> 사진 설명 -> AI 로딩 -> 엽서 선택 -> 블로그 작성 */}
//       <Route path="/upload" element={<PhotoUpload />} />
//       <Route path="/description" element={<PhotoDescription />} />
//       <Route path="/loading" element={<LoadingBlogCreation />} />
//       <Route path="/postcard-selection" element={<PostcardSelection />} />
//       <Route path="/blog-content" element={<BlogContentPage />} />

//       {/* 없는 경로 => '/storage' */}
//       <Route path="*" element={<Navigate to="/storage" replace />} />
//     </Routes>
//   );
// }

// export default AppRouter;
