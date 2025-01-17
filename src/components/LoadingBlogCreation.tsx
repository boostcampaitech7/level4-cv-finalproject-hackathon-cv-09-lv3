import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function LoadingBlogCreation() {
  const navigate = useNavigate();
  const { setBlogContent, setGeneratedPostcards } = useTravelContext();

  useEffect(() => {
    const generateBlogAndPostcards = async () => {
      setTimeout(() => {
        setBlogContent("AI가 생성한 예시 여행 블로그 내용입니다!");
        setGeneratedPostcards([
          { id: 1, url: "https://via.placeholder.com/200?text=Card1" },
          { id: 2, url: "https://via.placeholder.com/200?text=Card2" },
          { id: 3, url: "https://via.placeholder.com/200?text=Card3" },
        ]);
        navigate("/postcard-selection");
      }, 2000);
    };

    generateBlogAndPostcards();
  }, [navigate, setBlogContent, setGeneratedPostcards]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white border border-gray-200 rounded-md p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">
          여행 블로그 작성 중...
        </h1>
        <p className="text-gray-600">
          AI가 열심히 글을 쓰고 있어요! 잠시만 기다려 주세요.
        </p>
        {/* 로딩 스피너 넣기 */}
      </div>
    </Layout>
  );
}

export default LoadingBlogCreation;
