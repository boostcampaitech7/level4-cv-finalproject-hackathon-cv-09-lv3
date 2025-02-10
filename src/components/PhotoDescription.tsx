import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

// ✅ 업로드된 파일 타입 정의
interface UploadedFile {
  name: string;
  imageUrl : string;
}

function PhotoDescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = (location.state as { projectId: number }) || {};

  const { descriptions, setDescriptions } = useTravelContext();
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorCountryCity, setErrorCountryCity] = useState("");
  const [errorDate, setErrorDate] = useState("");

  // Meta data states
  const [countryCity, setCountryCity] = useState("");
  const [date, setDate] = useState("");
  const [withWho, setWithWho] = useState("");

  useEffect(() => {
    async function fetchUploadedFiles() {
      try {
        setError("");
        setLoading(true);

        // ✅ 업로드된 파일 목록 불러오기
        const uploadedFiles = await apiFetch(`/projects/${projectId}/files`, { method: "GET" });

        console.log("📌 업로드된 파일 목록:", uploadedFiles);

        // 🔹 파일명만 저장
        const photoData: UploadedFile[] = await Promise.all(
          uploadedFiles.files.map(async (file: any) => {
            const imageBlob = await apiFetch(`/projects/${projectId}/${file.name}/image`);
            const imageUrl = URL.createObjectURL(imageBlob);
            return {
              name: file.name,
              imageUrl: imageUrl, // 이미지 URL 추가
            };
          })
        );

        setPhotos(photoData);
        setDescriptions(photoData.map(() => ""));
      } catch (err: any) {
        console.error("❌ 파일 불러오기 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchUploadedFiles();
  }, [projectId, setDescriptions]);

  const handleDescChange = (index: number, value: string) => {
    const newDescs = [...descriptions];
    newDescs[index] = value;
    setDescriptions(newDescs);
  };

  const handleChangeCountryCity = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountryCity(value);
    setErrorCountryCity(/^.+\/.+$/.test(value) ? "" : "올바른 형식이 아닙니다. 예: Korea/Jeju");
  };

  const handleChangeDate = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDate(value);
    setErrorDate(/^.+\..+$/.test(value) ? "" : "올바른 형식이 아닙니다. 예: 2024.06");
  };

  const handleGenerate = async () => {
    try {
      setError("");
      setLoading(true);

      const meta_data = { "Country/City": countryCity, date, With: withWho };
      const texts = descriptions;
      const jsonContent = JSON.stringify({ meta_data, texts });

      const formData = new FormData();
      formData.append("input", new Blob([jsonContent], { type: "application/json" }), "descriptions.json");

      // ✅ descriptions.json 저장
      await apiFetch(`/projects/${projectId}/descriptions`, { method: "POST", body: formData });

      // ✅ 상태를 2로 업데이트
      await apiFetch(`/projects/${projectId}/status?status=2`, { method: "POST" });

      // ✅ 로딩 화면으로 이동
      navigate("/loading", { state: { projectId } });
    } catch (err: any) {
      setError(err.message ?? "설명 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-800">사진 설명 작성</h1>
          {error && <p className="text-red-500">{error}</p>}
          {loading && <p className="text-blue-500">데이터를 불러오는 중...</p>}

          {/* Meta Data 입력 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">어디를 방문하셨나요?</label>
              <input
                type="text"
                placeholder="예: Korea/Jeju"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={countryCity}
                onChange={handleChangeCountryCity}
              />
              {errorCountryCity && <p className="mt-1 text-sm text-red-500">{errorCountryCity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">언제 다녀오셨나요?</label>
              <input
                type="text"
                placeholder="예: 2024.06"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={date}
                onChange={handleChangeDate}
              />
              {errorDate && <p className="mt-1 text-sm text-red-500">{errorDate}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">누구와 함께 다녀오셨나요?</label>
              <input
                type="text"
                placeholder="예: Family"
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
                value={withWho}
                onChange={(e) => setWithWho(e.target.value)}
              />
            </div>
          </div>

          {/* 사진 설명 입력 */}
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
                {/* ✅ 이미지 이름만 표시 */}
                <p className="text-lg font-semibold text-gray-700">{photo.name}</p>
                <img src={photo.imageUrl} alt={photo.name} className="w-32 h-32 object-cover rounded-lg" />
                <input
                  type="text"
                  placeholder="설명을 입력하세요..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 mt-2"
                  value={descriptions[index] || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleDescChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} className="w-full py-3 px-6 bg-brand-500 text-white font-semibold rounded-lg shadow-lg hover:bg-brand-600 transition duration-200">
            생성하기
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PhotoDescription;








// import React, { ChangeEvent, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function PhotoDescription() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { projectId } = (location.state as { projectId: number }) || {};
//   const { photos, descriptions, setDescriptions } = useTravelContext();
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [errorcountryCity, setErrorcountryCity] = useState("");
//   const [errorDate, setErrorDate] = useState("");

//   // Meta data states
//   const [countryCity, setCountryCity] = useState("");
//   const [date, setDate] = useState("");
//   const [withWho, setWithWho] = useState("");

//   const handleDescChange = (index: number, value: string) => {
//     const newDescs = [...descriptions];
//     newDescs[index] = value;
//     setDescriptions(newDescs);
//   };

//   const handleChangecountryCity = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setCountryCity(value);

//     // 정규식: 중간에 "/" 포함 여부 검사
//     const isValidFormat = /^.+\/.+$/.test(value);

//     if (!isValidFormat) {
//       setErrorcountryCity("올바른 형식이 아닙니다. 예: Korea/Jeju");
//     } else {
//       setErrorcountryCity("");
//     }
//   };

//   const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setDate(value);

//     // 정규식: 중간에 "/" 포함 여부 검사
//     const isValidFormat = /^.+\..+$/.test(value);

//     if (!isValidFormat) {
//       setErrorDate("올바른 형식이 아닙니다. 예: 2024.06");
//     } else {
//       setErrorDate("");
//     }
//   };



//   const handleGenerate = async () => {
//     try {
//       setError("");
//       setLoading(true);

//       // descriptions.json 형식 생성
//       const meta_data = {
//         "Country/City": countryCity,
//         date,
//         With: withWho,
//       };

//       const texts = descriptions;

//       const jsonContent = JSON.stringify({ meta_data, texts });

//       // FormData 생성: JSON 파일로 전송
//       const formData = new FormData();
//       const jsonBlob = new Blob([jsonContent], { type: "application/json" });
//       formData.append("input", jsonBlob, "descriptions.json");

//       // 백엔드 API 호출 (파일 업로드)
//       await apiFetch(`/projects/${projectId}/descriptions`, {
//         method: "POST",
//         body: formData,
//       });

//       // 상태 업데이트: 상태 2으로 전환
//       await apiFetch(`/projects/${projectId}/status?status=2`, {
//         method: "POST",
//       });

//       // 로딩 화면으로 이동 (AI 생성)
//       navigate("/loading", { state: { projectId } });
//     } catch (err: any) {
//       setError(err.message ?? "설명 생성 중 에러가 발생했습니다.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="bg-gray-50 min-h-screen p-6">
//         <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
//           <h1 className="text-3xl font-bold text-gray-800">사진 설명 작성</h1>
//           {error && <p className="text-red-500">{error}</p>}

//           {/* Meta Data Section */}
//           <div className="grid gap-6 sm:grid-cols-2">
//           <div className="grid gap-6 sm:grid-cols-2">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           어디를 방문하셨나요?
//         </label>
//         <input
//           type="text"
//           placeholder="예: Korea/Jeju"
//           className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
//           value={countryCity}
//           onChange={handleChangecountryCity}
//         />
//         {errorcountryCity && <p className="mt-1 text-sm text-red-500">{errorcountryCity}</p>}
//       </div>
//     </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 언제 다녀오셨나요?
//               </label>
//               <input
//                 type="text"
//                 placeholder="예: 2024.06"
//                 className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
//                 value={date}
//                 onChange={handleChangeDate}
//               />
//               {errorDate && <p className="mt-1 text-sm text-red-500">{errorDate}</p>}
//             </div>
//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 누구와 함께 다녀오셨나요?
//               </label>
//               <input
//                 type="text"
//                 placeholder="예: Family"
//                 className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
//                 value={withWho}
//                 onChange={(e) => setWithWho(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Photo Descriptions Section */}
//           <div className="space-y-4">
//             {photos.map((photo, index) => (
//               <div
//                 key={index}
//                 className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200"
//               >
//                 <p className="text-sm font-semibold text-gray-600 mb-2">{photo.name}</p>
//                 <input
//                   type="text"
//                   placeholder="예: 에메랄드빛 해변에서 느꼈던 감동..."
//                   className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500"
//                   value={descriptions[index] || ""}
//                   onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                     handleDescChange(index, e.target.value)
//                   }
//                 />
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={handleGenerate}
//             disabled={errorcountryCity !== "" || errorDate !== ""}
//             className="w-full py-3 px-6 bg-brand-500 text-white font-semibold rounded-lg shadow-lg hover:bg-brand-600 transition duration-200"
//           >
//             생성하기
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default PhotoDescription;
