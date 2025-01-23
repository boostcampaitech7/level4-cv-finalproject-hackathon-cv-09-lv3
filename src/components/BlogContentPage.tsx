import React, { useState, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function BlogContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { blogContent, setBlogContent } = useTravelContext();
  const { selectedPostcardId, projectId } =
    (location.state as {
      selectedPostcardId?: number;
      projectId?: number;
    }) || {};

  const [tempContent, setTempContent] = useState(blogContent);
  const [error, setError] = useState("");

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      setError("");
      setBlogContent(tempContent);

      // DB에도 저장한다면:
      // POST /projects/{projectId}/blog  body: { postcardId, content }
      if (projectId) {
        await apiFetch(`/projects/${projectId}/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postcardId: selectedPostcardId,
            content: tempContent,
          }),
        });
      }

      alert("저장되었습니다!");
      navigate("/storage"); // 저장 후 보관함으로 가거나 원하는 경로
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          생성된 여행 블로그
        </h1>
        {error && <p className="text-red-500 mb-2">에러 발생: {error}</p>}

        {selectedPostcardId && (
          <p className="text-sm text-gray-500 mb-4">
            선택된 엽서 ID: {selectedPostcardId}
          </p>
        )}

        <textarea
          className="w-full h-60 border border-gray-300 rounded px-3 py-2 text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={tempContent}
          onChange={handleContentChange}
        />

        <button className="btn-primary mt-4" onClick={handleSave}>
          저장하기
        </button>

        {blogContent && (
          <div className="prose mt-8">
            <h2>미리보기</h2>
            <p>{blogContent}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default BlogContentPage;
