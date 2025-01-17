// src/components/PostcardEdit.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";

interface Postcard {
  id: number;
  title: string;
  content: string;
}

function PostcardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 서버에서 받아온 엽서 원본 데이터
  const [postcardData, setPostcardData] = useState<Postcard | null>(null);
  // 편집 중인 타이틀/내용 (기본값은 postcardData를 불러온 뒤 채움)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    // 실제로는 서버에서 {id}에 해당하는 엽서 정보를 가져옴
    // 여기서는 간단히 Mock 예시넣어둠
    const fakeData: Postcard = {
      id: Number(id),
      title: "하와이 여행 엽서",
      content:
        "하와이의 아름다운 해변과 맛있는 음식, 여유로운 분위기를 즐겼습니다!",
    };
    setPostcardData(fakeData);
    // 초기 값 설정
    setTitle(fakeData.title);
    setContent(fakeData.content);
  }, [id]);

  const handleSave = () => {
    // 실제 저장 로직 (API call, server update 등)
    // 예: fetch(`/api/postcards/${id}`, { method: 'PUT', body: JSON.stringify({...}) })
    // 저장이 완료되면 다시 상세 페이지로 이동하게
    navigate(`/postcard/${id}`);
  };

  if (!postcardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={title}
              onChange={handleChangeTitle}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
