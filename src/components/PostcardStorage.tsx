import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

interface Postcard {
  id: number;
  title: string;
}

function PostcardStorage() {
  const navigate = useNavigate();

  const postcards: Postcard[] = [
    { id: 1, title: "하와이 여행 엽서" },
    { id: 2, title: "도쿄 여행 엽서" },
    { id: 3, title: "파리 여행 엽서" },
  ];

  const handleCreateBlog = () => {
    navigate("/upload");
  };

  const handleSelectPostcard = (id: number) => {
    navigate(`/postcard/${id}`);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          나의 엽서 보관함
        </h1>
        <button
          onClick={handleCreateBlog}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          새로운 블로그 작성하기
        </button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {postcards.map((pc) => (
          <li
            key={pc.id}
            className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSelectPostcard(pc.id)}
          >
            <h2 className="text-lg font-bold text-gray-700 mb-1">
              {pc.title}
            </h2>
            <p className="text-sm text-gray-500">
              자세히 보려면 클릭하세요.
            </p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export default PostcardStorage;
