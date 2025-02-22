// /data/ephemeral/home/travelog/src/components/PostcardSelection.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function PostcardSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = (location.state as { projectId: number }) || {};
  const { generatedPostcards } = useTravelContext();

  // 사용자가 엽서를 선택하면:
  const handleSelectCard = async (id: number, url: string) => {
    try {
      // 1) 백엔드로 이미지 URL 전송
      await apiFetch(`/projects/${projectId}/image_url?input=${encodeURIComponent(url)}`, {
        method: "POST",
      });

      // 2) 상태 업데이트: 상태를 "5"로 변경
      await apiFetch(`/projects/${projectId}/status?status=5`, {
        method: "POST",
      });

      // 3) /blog-content로 이동
      navigate("/blog-content", {
        state: { selectedPostcard: { id, url }, projectId },
      });
    } catch (err: any) {
      console.error("이미지 선택 중 오류 발생:", err);
      alert("이미지 선택 중 오류가 발생했습니다. " + err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          엽서를 선택해 보세요!
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {generatedPostcards.map((pc) => (
          <div
            key={pc.id}
            className="relative bg-white border border-gray-200 rounded-lg shadow-lg 
                       overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleSelectCard(pc.id, pc.url)}
          >
            <div className="aspect-square">
              <img
                src={pc.url}
                alt={`Postcard ${pc.id}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 w-full bg-white bg-opacity-80 py-2 text-center">
              <p className="text-sm font-semibold text-gray-800">엽서 {pc.id}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default PostcardSelection;


// // PostcardSelection.tsx
// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function PostcardSelection() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { projectId } = (location.state as { projectId: number }) || {};
//   const { generatedPostcards } = useTravelContext();

//   // 사용자가 엽서를 선택하면:
//   const handleSelectCard = async (id: number, url: string) => {
//     try {
//       // 1) 백엔드로 이미지 URL 전송 (쿼리 파라미터 방식)
//       await apiFetch(
//         `/projects/${projectId}/image_url?input=${encodeURIComponent(url)}`,
//         { method: "POST" }
//       );

//       // 2) 상태를 4 (스탬프 확인이 필요한 상태)로 업데이트
//       await apiFetch(`/projects/${projectId}/status?status=4`, {
//         method: "POST",
//       });

//       // 3) StampChecker 페이지로 이동 (선택한 엽서 정보와 projectId 전달)
//       navigate("/stamp-checker", {
//         state: {
//           selectedPostcard: { id, url },
//           projectId,
//         },
//       });
//     } catch (err: any) {
//       console.error("이미지 선택 중 오류 발생:", err);
//       alert("이미지 선택 중 오류가 발생했습니다. " + err.message);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto text-center">
//         <h1 className="text-3xl font-bold text-gray-800 mb-8">
//           엽서를 선택해 보세요!
//         </h1>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {generatedPostcards.map((pc) => (
//           <div
//             key={pc.id}
//             className="relative bg-white border border-gray-200 rounded-lg shadow-lg 
//                        overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
//             onClick={() => handleSelectCard(pc.id, pc.url)}
//           >
//             <div className="aspect-square">
//               <img
//                 src={pc.url}
//                 alt={`Postcard ${pc.id}`}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="absolute bottom-0 w-full bg-white bg-opacity-80 py-2 text-center">
//               <p className="text-sm font-semibold text-gray-800">엽서 {pc.id}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </Layout>
//   );
// }

// export default PostcardSelection;
