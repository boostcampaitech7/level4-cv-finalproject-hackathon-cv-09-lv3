import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function PostcardSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = (location.state as { projectId: number }) || {}; // 필요하다면
  const { generatedPostcards } = useTravelContext();

  const handleSelectCard = (id: number) => {
    // 선택한 엽서 ID와 함께 이동
    navigate("/blog-content", {
      state: { selectedPostcardId: id, projectId },
    });
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">엽서를 선택해 보세요!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {generatedPostcards.map((pc) => (
          <div
            key={pc.id}
            className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
            onClick={() => handleSelectCard(pc.id)}
          >
            <img
              src={pc.url}
              alt={`Postcard ${pc.id}`}
              className="mx-auto mb-2 w-full h-40 object-cover"
            />
            <p className="font-semibold text-gray-700">엽서 {pc.id}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default PostcardSelection;
