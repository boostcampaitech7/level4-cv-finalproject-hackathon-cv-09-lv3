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

  const [selectedTone, setSelectedTone] = useState("");
  const [showToneModal, setShowToneModal] = useState(false);

  // 1) 기존 데이터 불러오기
  useEffect(() => {
    async function fetchPostcard() {
      if (!id) return;
      try {
        setError("");
        // GET /projects/{id} => { id, name, content, ... }
        const data = await apiFetch(`/projects/${id}`);
        const blogJson = await apiFetch(`/projects/${id}/project_blog_re`);
        
        const mapped: Postcard = {
          id: data.id,
          title: data.name || "제목 없음",
          content: blogJson.result || "",
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
      // const values = {
      //   name: title,
      //   content: content, // 백엔드가 content 필드를 DB에 저장한다고 가정
      // };

      // await apiFetch(`/projects/${id}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(values),
      // });
      const formData = new FormData();
      const jsonData = JSON.stringify({ result: content });
      const blob = new Blob([jsonData], { type: "application/json" });
      formData.append("input", blob, "blog.json");

      await apiFetch(`/projects/${id}/project_blog`, {
              method: "POST",
              body: formData,
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

  const handleToneChangeBlog = async () => {
    try {
          setError("");
          await apiFetch(`/inference/${id}/modify?tone=${selectedTone}`, {
            method: "POST",
            // body: formData,
          });
  } catch (err: any) {
    console.error("사진 업로드/프로젝트 생성 실패:", err);
    setError(err.message || "알 수 없는 오류가 발생했습니다.");
  }
};
  const toneMap: Record<string, 'cute' | 'serious' | 'info'> = {
    '귀여운 말투': 'cute',
    '진중한 말투': 'serious',
    '정보전달 말투': 'info',
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
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={title}
              onChange={handleChangeTitle}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={5}
              value={content}
              onChange={handleChangeContent}
            />
          </div>

          <div className="flex space-x-4">
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              저장하기
            </button>
            <button onClick={() => setShowToneModal(true)} className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors">
              문체 바꾸기
            </button>
            <button onClick={() => navigate(`/postcard/${id}`)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded transition-colors ml-auto">
              취소
            </button>
          </div>
        </div>
      </div>

      {showToneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">문체 선택</h2>
            <div className="space-y-2">
            {['귀여운 말투', '진중한 말투', '정보전달 말투'].map((tone) => {
              const mappedTone = toneMap[tone]; // mappedTone을 'cute' | 'serious' | 'info' 타입으로 변환
              return (
                <button
                  key={mappedTone}
                  onClick={() => setSelectedTone(mappedTone)} // 타입이 'cute' | 'serious' | 'info'로 보장됨
                  className={`w-full py-2 px-4 rounded text-center ${
                    selectedTone === mappedTone ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {tone}
                </button>
              );
            })}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button 
              onClick={handleToneChangeBlog}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                진행하기
              </button>
              <button onClick={() => setShowToneModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default PostcardEdit;
