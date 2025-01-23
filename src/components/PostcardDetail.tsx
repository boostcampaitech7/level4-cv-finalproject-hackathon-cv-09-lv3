// src/components/PostcardDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";  // JWT 포함 fetch 래퍼

interface Postcard {
  id: number;
  title: string;
  content: string;
}

function PostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postcardData, setPostcardData] = useState<Postcard | null>(null);
  const [error, setError] = useState("");

  // 엽서(프로젝트) 상세 조회
  useEffect(() => {
    async function fetchPostcard() {
      if (!id) return;
      try {
        setError("");
        // GET /projects/{id}
        const data = await apiFetch(`/projects/${id}`);
        // 백엔드 응답 예) { id, name, content, ... }
        const mapped: Postcard = {
          id: data.id,
          title: data.name || "제목 없음",
          content: data.content || "",
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
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-md p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {postcardData.title}
          </h1>
          <p className="text-gray-700 mb-6">
            {postcardData.content || "(내용이 없습니다.)"}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              수정하기
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PostcardDetail;
