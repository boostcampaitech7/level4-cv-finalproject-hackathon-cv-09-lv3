// /data/ephemeral/home/travelog/src/components/StampChecker.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";

function StampChecker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, selectedPostcard } = (location.state as {
    projectId: number;
    selectedPostcard: { id: number; url: string };
  }) || {};

  const [stampUrl, setStampUrl] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStamp() {
      try {
        // GET 프로젝트 도장 이미지
        const blob = await apiFetch(`/projects/${projectId}/project_stamp`, {
          method: "GET",
        });
        const imageUrl = URL.createObjectURL(blob);
        setStampUrl(imageUrl);
      } catch (err: any) {
        console.error("Stamp 이미지 불러오기 실패:", err);
        setError(err.message);
      }
    }
    if (projectId) {
      fetchStamp();
    }
  }, [projectId]);

  const handleConfirmStamp = async () => {
    try {
      // 상태 업데이트: 상태를 "4"로 변경
      await apiFetch(`/projects/${projectId}/status?status=4`, {
        method: "POST",
      });
      // /postcard-selection로 이동
      navigate("/postcard-selection", {
        state: { selectedPostcard, projectId },
      });
    } catch (err: any) {
      console.error("스탬프 확인 업데이트 실패:", err);
      alert("스탬프 확인 업데이트 실패: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          생성된 스탬프를 확인해 보세요!
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        {stampUrl ? (
          <div className="flex flex-col items-center">
            <img src={stampUrl} alt="Stamp" className="max-w-full h-auto mb-4" />
            <button
              onClick={handleConfirmStamp}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              확인했습니다!
            </button>
          </div>
        ) : (
          <p>스탬프 이미지를 불러오는 중...</p>
        )}
      </div>
    </Layout>
  );
}

export default StampChecker;


// // StampChecker.tsx (수정된 부분)
// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function StampChecker() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { projectId, selectedPostcard } = (location.state as {
//     projectId: number;
//     selectedPostcard: { id: number; url: string };
//   }) || {};

//   const [stampUrl, setStampUrl] = useState<string>("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchStamp() {
//       try {
//         // GET 요청으로 프로젝트 폴더 내 stamp.png를 받아옵니다.
//         // apiFetch가 Blob 객체를 반환한다고 가정합니다.
//         const blob = await apiFetch(`/projects/${projectId}/project_stamp`, {
//           method: "GET",
//         });
//         const imageUrl = URL.createObjectURL(blob);
//         setStampUrl(imageUrl);
//       } catch (err: any) {
//         console.error("Stamp 이미지 불러오기 실패:", err);
//         setError(err.message);
//       }
//     }
//     if (projectId) {
//       fetchStamp();
//     }
//   }, [projectId]);

//   const handleConfirmStamp = async () => {
//     try {
//       // 상태를 5 (블로그 글 수정이 필요한 상태)로 업데이트
//       await apiFetch(`/projects/${projectId}/status?status=5`, {
//         method: "POST",
//       });
//       // BlogContentPage로 이동
//       navigate("/blog-content", {
//         state: { selectedPostcard, projectId },
//       });
//     } catch (err: any) {
//       console.error("스탬프 확인 업데이트 실패:", err);
//       alert("스탬프 확인 업데이트 실패: " + err.message);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto text-center">
//         <h1 className="text-3xl font-bold text-gray-800 mb-8">
//           생성된 스탬프를 확인해 보세요!
//         </h1>
//         {error && <p className="text-red-500">{error}</p>}
//         {stampUrl ? (
//           <div className="flex flex-col items-center">
//             <img src={stampUrl} alt="Stamp" className="max-w-full h-auto mb-4" />
//             <button
//               onClick={handleConfirmStamp}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//             >
//               확인했습니다!
//             </button>
//           </div>
//         ) : (
//           <p>스탬프 이미지를 불러오는 중...</p>
//         )}
//       </div>
//     </Layout>
//   );
// }

// export default StampChecker;
