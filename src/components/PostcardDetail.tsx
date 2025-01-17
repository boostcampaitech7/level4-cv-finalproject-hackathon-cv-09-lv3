import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";

interface Postcard {
  id: number;
  title: string;
  content: string;
}

function PostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postcardData, setPostcardData] = useState<Postcard | null>(null);

  useEffect(() => {
    // 실제로는 서버에서 해당 ID의 엽서 데이터를 fetch 하도록 수정 TODO
    // 여기서는 간단한 Mock 예시넣어둠
    const fakeData: Postcard = {
      id: Number(id),
      title: "하와이 여행 엽서",
      content:
        "하와이의 아름다운 해변과 맛있는 음식, 여유로운 분위기를 즐겼습니다!",
    };
    setPostcardData(fakeData);
  }, [id]);

  const handleEdit = () => {
    navigate(`/postcard/${id}/edit`);
  };

  if (!postcardData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
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
          <p className="text-gray-700 mb-6">{postcardData.content}</p>

          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            수정하기
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PostcardDetail;