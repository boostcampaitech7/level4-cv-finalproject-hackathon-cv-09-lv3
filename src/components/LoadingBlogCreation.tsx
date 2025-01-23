import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function LoadingBlogCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = (location.state as { projectId: number }) || {};

  const { setBlogContent, setGeneratedPostcards } = useTravelContext();
  const [error, setError] = useState("");

  useEffect(() => {
    async function generateBlogAndPostcards() {
      try {
        setError("");

        // 예: POST /inference/predict  (projectId, etc.)
        // AI 서버가 엽서 이미지 3장 + 블로그 본문 초안을 생성한다고 가정
        const body = { projectId };
        const result = await apiFetch("/inference/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        // result 예) { postcards: [{id, url}, ...], blogDraft: "...." }

        setBlogContent(result.blogDraft || "");
        setGeneratedPostcards(result.postcards || []);

        // 2) 이동
        navigate("/postcard-selection");
      } catch (err: any) {
        setError(err.message);
      }
    }

    generateBlogAndPostcards();
  }, [navigate, projectId, setBlogContent, setGeneratedPostcards]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white border border-gray-200 rounded-md p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">여행 블로그 작성 중...</h1>
        {error ? (
          <p className="text-red-500">에러 발생: {error}</p>
        ) : (
          <p className="text-gray-600">
            AI가 열심히 글을 쓰고 있어요! 잠시만 기다려 주세요.
          </p>
        )}
        {/* 로딩 스피너 */}
      </div>
    </Layout>
  );
}

export default LoadingBlogCreation;
