// ###########

import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function PhotoUpload() {
  const navigate = useNavigate();
  const { photos, setPhotos } = useTravelContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      setError("");

      // 프로젝트 생성 요청: name과 status를 FormData로 함께 전달
      const formData = new FormData();
      formData.append("name", "새 여행 엽서");
      formData.append("status", "1");

      const createdProject = await apiFetch("/projects", {
        method: "PUT",
        body: formData,
      });

      const projectId = createdProject.id;

      // 사진 업로드
      const uploadForm = new FormData();
      photos.forEach((file) => {
        uploadForm.append("input", file, file.name);
      });

      await apiFetch(`/projects/${projectId}/files`, {
        method: "POST",
        body: uploadForm,
      });

      // 상태 2 업데이트는 PhotoDescription.tsx에서 처리하므로 여기서는 생략합니다.

      // 다음 단계로 이동
      navigate("/description", { state: { projectId } });
    } catch (err: any) {
      console.error("사진 업로드/프로젝트 생성 실패:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">사진 업로드</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-blue-500 text-sm mb-4">업로드 중...</p>}

        <label className="block text-sm font-medium text-gray-700 mb-3">
          사진 선택 (여러 사진 가능)
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
                     file:bg-blue-100 file:text-blue-700
                     hover:file:bg-blue-200 focus:outline-none
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {photos.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow bg-gray-50 text-center"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={photo.name}
                  className="w-full h-40 object-cover mb-2 rounded-md"
                />
                <p className="text-sm font-medium text-gray-800 truncate">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={photos.length === 0 || loading}
          className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-semibold 
                     ${
                       photos.length === 0 || loading
                         ? "bg-gray-400 cursor-not-allowed"
                         : "bg-blue-600 hover:bg-blue-700 transition"
                     }`}
        >
          다음 단계
        </button>
      </div>
    </Layout>
  );
}

export default PhotoUpload;



// ###########

// import React, { ChangeEvent, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function PhotoUpload() {
//   const navigate = useNavigate();
//   const { photos, setPhotos } = useTravelContext();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     setPhotos(files);
//   };

//   const handleNext = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // 프로젝트 생성
//       const formData = new FormData();
//       formData.append("name", "새 여행 엽서");

//       const createdProject = await apiFetch("/projects", {
//         method: "PUT",
//         body: formData,
//       });

//       const projectId = createdProject.id;

//       // 사진 업로드
//       const uploadForm = new FormData();
//       photos.forEach((file) => {
//         uploadForm.append("input", file, file.name);
//       });

//       await apiFetch(`/projects/${projectId}/files`, {
//         method: "POST",
//         body: uploadForm,
//       });

//       // 상태 2로 업데이트 (Query Parameter 방식)
//       await apiFetch(`/projects/${projectId}/status?status=2`, {
//         method: "POST",
//       });

//       // 다음 단계로 이동
//       navigate("/description", { state: { projectId } });
//     } catch (err: any) {
//       console.error("사진 업로드/프로젝트 생성 실패:", err);
//       setError(err.message || "알 수 없는 오류가 발생했습니다.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md max-w-3xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">사진 업로드</h1>

//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//         {loading && <p className="text-blue-500 text-sm mb-4">업로드 중...</p>}

//         <label className="block text-sm font-medium text-gray-700 mb-3">
//           사진 선택 (여러 사진 가능)
//         </label>
//         <input
//           type="file"
//           multiple
//           onChange={handleFileChange}
//           accept="image/*"
//           className="block w-full text-sm text-gray-500
//                      file:mr-4 file:py-2 file:px-4
//                      file:rounded file:border-0
//                      file:text-sm file:font-semibold
//                      file:bg-blue-100 file:text-blue-700
//                      hover:file:bg-blue-200 focus:outline-none
//                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />

//         {photos.length > 0 && (
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {photos.map((photo, index) => (
//               <div
//                 key={index}
//                 className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow bg-gray-50 text-center"
//               >
//                 <img
//                   src={URL.createObjectURL(photo)}
//                   alt={photo.name}
//                   className="w-full h-40 object-cover mb-2 rounded-md"
//                 />
//                 <p className="text-sm font-medium text-gray-800 truncate">
//                   {photo.name}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         <button
//           onClick={handleNext}
//           disabled={photos.length === 0 || loading}
//           className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-semibold 
//                      ${
//                        photos.length === 0 || loading
//                          ? "bg-gray-400 cursor-not-allowed"
//                          : "bg-blue-600 hover:bg-blue-700 transition"
//                      }`}
//         >
//           다음 단계
//         </button>
//       </div>
//     </Layout>
//   );
// }

// export default PhotoUpload;
