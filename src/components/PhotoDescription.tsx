import React, { ChangeEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function PhotoDescription() {
  const navigate = useNavigate();
  const location = useLocation();

  // /upload에서 넘겨준 projectId
  const { projectId } = (location.state as { projectId: number }) || {};

  const { photos, descriptions, setDescriptions } = useTravelContext();
  const [error, setError] = useState("");

  // Meta data states
  const [countryCity, setCountryCity] = useState("");
  const [date, setDate] = useState("");
  const [withWho, setWithWho] = useState("");

  const handleDescChange = (index: number, value: string) => {
    const newDescs = [...descriptions];
    newDescs[index] = value;
    setDescriptions(newDescs);
  };

  const handleGenerate = async () => {
    try {
      setError("");

      // descriptions.json 형식 생성
      const meta_data = {
        "Country/City": countryCity,
        date,
        With: withWho,
      };

      const texts = descriptions;

      const jsonContent = JSON.stringify({ meta_data, texts });

      // FormData 생성: JSON 파일로 전송
      const formData = new FormData();
      const jsonBlob = new Blob([jsonContent], { type: "application/json" });
      formData.append("input", jsonBlob, "descriptions.json");

      // 백엔드 API 호출
      await apiFetch(`/projects/${projectId}/descriptions`, {
        method: "POST",
        body: formData,
      });

      // 로딩 화면으로 이동 (AI 생성)
      navigate("/loading", { state: { projectId } });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-800">사진 설명 작성</h1>
          {error && <p className="text-red-500">{error}</p>}

          {/* Meta Data Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                어디를 방문하셨나요?
              </label>
              <input
                type="text"
                placeholder="예: Korea/Jeju"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={countryCity}
                onChange={(e) => setCountryCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                언제 다녀오셨나요?
              </label>
              <input
                type="text"
                placeholder="예: 2024.06"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                누구와 함께 다녀오셨나요?
              </label>
              <input
                type="text"
                placeholder="예: Family"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={withWho}
                onChange={(e) => setWithWho(e.target.value)}
              />
            </div>
          </div>

          {/* Photo Descriptions Section */}
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200"
              >
                <p className="text-sm font-semibold text-gray-600 mb-2">{photo.name}</p>
                <input
                  type="text"
                  placeholder="예: 에메랄드빛 해변에서 느꼈던 감동..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  value={descriptions[index] || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleDescChange(index, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 px-6 bg-brand-500 text-white font-semibold rounded-lg shadow-lg hover:bg-brand-600 transition duration-200"
          >
            생성하기
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PhotoDescription;