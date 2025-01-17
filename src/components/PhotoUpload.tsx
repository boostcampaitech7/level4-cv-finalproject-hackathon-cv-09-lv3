import React, { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function PhotoUpload() {
  const navigate = useNavigate();
  const { photos, setPhotos } = useTravelContext();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleNext = () => {
    navigate("/description");
  };

  return (
    <Layout>
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">사진 업로드</h1>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          업로드할 사진들
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="image/*"
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:text-sm file:font-semibold
                     file:bg-brand-50 file:text-brand-700
                     hover:file:bg-brand-100
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        {photos.length > 0 && (
          <ul className="mt-4 mb-6 space-y-2">
            {photos.map((photo, index) => (
              <li key={index} className="text-sm text-gray-600 truncate">
                {photo.name}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleNext}
          disabled={photos.length === 0}
          className={`btn-primary ${
            photos.length === 0 && "opacity-50 cursor-not-allowed"
          }`}
        >
          다음 단계
        </button>
      </div>
    </Layout>
  );
}

export default PhotoUpload;
