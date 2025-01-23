// src/components/PhotoUpload.tsx
import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function PhotoUpload() {
  const navigate = useNavigate();
  const { photos, setPhotos } = useTravelContext();

  // 임시 상태: 업로드 중 로딩 표시를 위해
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files); // 아직은 로컬 state
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      setError("");

      // 1) 새 프로젝트 생성 (이름=“새 여행 엽서”)
      const formData = new FormData();
      formData.append("name", "새 여행 엽서");
      const createdProject = await apiFetch("/projects", {
        method: "PUT",
        body: formData,
      });
      // createdProject = { id, name, owner_id, ...}

      const projectId = createdProject.id;

      // 2) 업로드된 파일을 실제 서버에 전송
      // (백엔드에서 POST /projects/{projectId}/files 라우트를 예시로 가정)
      // 여러 파일 전송 가능 => FormData("files", file, file.name)...
      const uploadForm = new FormData();
      photos.forEach((file) => {
        uploadForm.append("files", file, file.name);
      });

      // 예: 백엔드에서 `@router.post("/{projectId}/files")`
      //     files: List[UploadFile] = File(None)
      //     user: schemas.User = Depends(requireUser)
      await apiFetch(`/projects/${projectId}/files`, {
        method: "POST",
        body: uploadForm,
      });
      // 보통 응답: 파일 DB 레코드들의 정보 [{id, name, content_type, ...}, ...]

      // 3) 모든 게 끝나면 “사진 설명 작성” 화면으로 이동
      //    프로젝트 ID도 함께 넘길지, TravelContext에 저장해도 됨
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
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">사진 업로드</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {loading && <p className="text-blue-500 mb-2">업로드 중...</p>}

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
          disabled={photos.length === 0 || loading}
          className={`btn-primary ${
            (photos.length === 0 || loading) && "opacity-50 cursor-not-allowed"
          }`}
        >
          다음 단계
        </button>
      </div>
    </Layout>
  );
}

export default PhotoUpload;
