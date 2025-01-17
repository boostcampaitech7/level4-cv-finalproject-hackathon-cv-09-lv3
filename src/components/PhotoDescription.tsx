import React, { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function PhotoDescription() {
  const navigate = useNavigate();
  const { photos, descriptions, setDescriptions } = useTravelContext();

  const handleDescChange = (index: number, value: string) => {
    const newDescs = [...descriptions];
    newDescs[index] = value;
    setDescriptions(newDescs);
  };

  const handleGenerate = () => {
    // 로딩 화면으로 이동하게
    navigate("/loading");
  };

  return (
    <Layout>
      {/* 예시예시 */}
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm space-y-6">
        <h1 className="text-2xl font-bold">사진 설명 작성</h1>
        {photos.map((photo, index) => (
          <div key={index}>
            <p className="text-sm text-gray-500 mb-2">{photo.name}</p>
            <input
              type="text"
              placeholder="예: 에메랄드빛 해변에서 느꼈던 감동..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              value={descriptions[index] || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleDescChange(index, e.target.value)
              }
            />
          </div>
        ))}

        <button
          onClick={handleGenerate}
          className="btn-primary mt-4"
        >
          생성하기
        </button>
      </div>
    </Layout>
  );
}

export default PhotoDescription;
