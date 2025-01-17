import React, { useState, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function BlogContentPage() {
  const location = useLocation();
  const { blogContent, setBlogContent } = useTravelContext();
  const { selectedPostcardId } =
    (location.state as { selectedPostcardId?: number }) || {};

  const [tempContent, setTempContent] = useState(blogContent);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
  };

  const handleSave = () => {
    setBlogContent(tempContent);
    alert("저장되었습니다!");
  };

  return (
    <Layout>
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          생성된 여행 블로그
        </h1>
        {selectedPostcardId && (
          <p className="text-sm text-gray-500 mb-4">
            선택된 엽서 ID: {selectedPostcardId}
          </p>
        )}

        {/* 여행 블로그 글 미리보기 */}
        <textarea
          className="w-full h-60 border border-gray-300 rounded px-3 py-2 text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={tempContent}
          onChange={handleContentChange}
        />

        <button
          className="btn-primary mt-4"
          onClick={handleSave}
        >
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
