// src/components/PostcardEdit.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";

interface Postcard {
  id: number;
  title: string;
  content: string;
}

function PostcardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postcardData, setPostcardData] = useState<Postcard | null>(null);
  const [error, setError] = useState("");

  // 편집 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 1) 기존 데이터 불러오기
  useEffect(() => {
    async function fetchPostcard() {
      if (!id) return;
      try {
        setError("");
        // GET /projects/{id} => { id, name, content, ... }
        const data = await apiFetch(`/projects/${id}`);

        const mapped: Postcard = {
          id: data.id,
          title: data.name || "제목 없음",
          content: data.content || "",
        };
        setPostcardData(mapped);

        // 폼 초기값
        setTitle(mapped.title);
        setContent(mapped.content);
      } catch (err: any) {
        console.error("프로젝트 불러오기 실패:", err);
        setError(err.message);
      }
    }
    fetchPostcard();
  }, [id]);

  // 2) 저장하기
  const handleSave = async () => {
    if (!id) return;
    try {
      setError("");

      // 백엔드: POST /projects/{id} => updateProject(id, values)
      // values 에 name, content 등을 담아 전송
      const values = {
        name: title,
        content: content, // 백엔드가 content 필드를 DB에 저장한다고 가정
      };

      await apiFetch(`/projects/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // 성공 시 상세 페이지로 이동
      navigate(`/postcard/${id}`);
    } catch (err: any) {
      console.error("프로젝트 수정 실패:", err);
      setError(err.message);
    }
  };

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
            엽서 수정 (ID: {postcardData.id})
          </h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={title}
              onChange={handleChangeTitle}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={5}
              value={content}
              onChange={handleChangeContent}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              저장하기
            </button>
            <button
              onClick={() => navigate(`/postcard/${id}`)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PostcardEdit;
