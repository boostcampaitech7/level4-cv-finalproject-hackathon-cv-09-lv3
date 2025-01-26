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

      const formData = new FormData();
      formData.append("name", "새 여행 엽서");

      const createdProject = await apiFetch("/projects", {
        method: "PUT",
        body: formData,
      });

      const projectId = createdProject.id;

      const uploadForm = new FormData();
      photos.forEach((file) => {
        uploadForm.append("input", file, file.name);
      });

      await apiFetch(`/projects/${projectId}/files`, {
        method: "POST",
        body: uploadForm,
      });

      navigate("/description", { state: { projectId } });
    } catch (err: any) {
      console.error("사진 업로드/프로젝트 생성 실패:", err);
      setError(err.message);
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


// // src/components/PhotoUpload.tsx
// import React, { ChangeEvent, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function PhotoUpload() {
//   const navigate = useNavigate();
//   const { photos, setPhotos } = useTravelContext();

//   // 임시 상태: 업로드 중 로딩 표시를 위해
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     setPhotos(files); // 아직은 로컬 state
//   };

//   const handleNext = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // 1) 새 프로젝트 생성 (이름=“새 여행 엽서”)
//       const formData = new FormData();
//       formData.append("name", "새 여행 엽서");
//       console.log(formData)
//       const createdProject = await apiFetch("/projects", {
//         method: "PUT",
//         body: formData,
//       });
//       // createdProject = { id, name, owner_id, ...}

//       const projectId = createdProject.id;

//       // 2) 업로드된 파일을 실제 서버에 전송
//       // (백엔드에서 POST /projects/{projectId}/files 라우트를 예시로 가정)
//       // 여러 파일 전송 가능 => FormData("files", file, file.name)...
//       const uploadForm = new FormData();
//       console.log(uploadForm)
//       photos.forEach((file) => {
//         uploadForm.append("input", file, file.name);
//       });
//       // uploadForm.append("id", projectId)
//       // 예: 백엔드에서 `@router.post("/{projectId}/files")`
//       //     files: List[UploadFile] = File(None)
//       //     user: schemas.User = Depends(requireUser)
//       await apiFetch(`/projects/${projectId}/files`, {
//         method: "POST",
//         body: uploadForm,
//       });
//       // 보통 응답: 파일 DB 레코드들의 정보 [{id, name, content_type, ...}, ...]

//       // 3) 모든 게 끝나면 “사진 설명 작성” 화면으로 이동
//       //    프로젝트 ID도 함께 넘길지, TravelContext에 저장해도 됨
//       navigate("/description", { state: { projectId } });
//     } catch (err: any) {
//       console.error("사진 업로드/프로젝트 생성 실패:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
//         <h1 className="text-2xl font-bold mb-4">사진 업로드</h1>

//         {error && <p className="text-red-500 mb-2">{error}</p>}
//         {loading && <p className="text-blue-500 mb-2">업로드 중...</p>}

//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           업로드할 사진들
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
//                      file:bg-brand-50 file:text-brand-700
//                      hover:file:bg-brand-100
//                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
//         />

//         {photos.length > 0 && (
//           <ul className="mt-4 mb-6 space-y-2">
//             {photos.map((photo, index) => (
//               <li key={index} className="text-sm text-gray-600 truncate">
//                 {photo.name}
//               </li>
//             ))}
//           </ul>
//         )}

//         <button
//           onClick={handleNext}
//           disabled={photos.length === 0 || loading}
//           className={`btn-primary ${
//             (photos.length === 0 || loading) && "opacity-50 cursor-not-allowed"
//           }`}
//         >
//           다음 단계
//         </button>
//       </div>
//     </Layout>
//   );
// }

// export default PhotoUpload;
