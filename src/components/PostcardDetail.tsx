// src/components/PostcardDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";  // JWT 포함 fetch 래퍼

interface Postcard {
  id: number;
  title: string;
  content: string;
  imageurl: string;
}

function PostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postcardData, setPostcardData] = useState<Postcard | null>(null);
  const [error, setError] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleShowContent = () => {
    setShowContent(true);
  };

  const handleShowImage = () => {
    setShowContent(false);
  };

  // 엽서(프로젝트) 상세 조회
  useEffect(() => {
    async function fetchPostcard() {
      if (!id) return;
      try {
        setError("");
        // GET /projects/{id}
        const data = await apiFetch(`/projects/${id}`);
        const image = await apiFetch(`/projects/${id}/project_postcard`);
        const imageUrl = URL.createObjectURL(image);
        const blogJson = await apiFetch(`/projects/${id}/project_blog`);
        // 백엔드 응답 예) { id, name, content, ... }
        const mapped: Postcard = {
          id: data.id,
          title: data.name || "제목 없음",
          content: blogJson.result || "",
          imageurl: imageUrl
        };
        setPostcardData(mapped);
      } catch (err: any) {
        console.error("프로젝트 상세 조회 실패:", err);
        setError(err.message);
      }
    }
    fetchPostcard();
  }, [id]);

  // 수정 페이지 이동
  const handleEdit = () => {
    if (id) {
      navigate(`/postcard/${id}/edit`);
    }
  };

  // 엽서(프로젝트) 삭제
  const handleDelete = async () => {
    if (!id) return;
    try {
      setError("");
      // DELETE /projects/{id}
      await apiFetch(`/projects/${id}`, {
        method: "DELETE",
      });
      alert("엽서가 삭제되었습니다.");
      navigate("/storage"); // 보관함으로 이동
    } catch (err: any) {
      console.error("엽서 삭제 실패:", err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">오류 발생: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!postcardData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        {!showContent ? (
          // 📌 엽서 스타일 (이미지 화면)
          <div className="relative w-[1050px] h-[750px] flex justify-center items-center">
            {/* 편지지 배경 */}
            <div className="absolute w-full h-full bg-white border border-gray-300 rounded-lg shadow-2xl rotate-[-5deg]"></div>

            {/* 이미지 */}
            <div className="relative w-[960px] h-[660px] bg-white border border-gray-400 rounded-lg shadow-lg rotate-[2deg] overflow-hidden flex justify-center items-center">
              {!isLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"></div>
              )}
              <img
                src={postcardData.imageurl}
                alt="Postcard"
                className={`w-full h-full object-cover transition-opacity duration-1000 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setIsLoaded(true)}
              />
            </div>

            {/* '글 보기' 버튼 - 오른쪽 아래 정렬 */}
            <div className="absolute bottom-[-50px] right-[-20px]">
              <button
                onClick={handleShowContent}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                글 보기
              </button>
            </div>
          </div>
        ) : (
          // 📌 글 페이지 (심플한 디자인)
          <div className="w-[800px] bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 text-lg text-center mb-6">
              {postcardData.content || "(내용이 없습니다.)"}
            </p>

            {/* 버튼들 - 오른쪽 정렬 */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                수정하기
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                삭제하기
              </button>
              <button
                onClick={handleShowImage}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                사진 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PostcardDetail;
