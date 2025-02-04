import React, { useState, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function BlogContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { blogContent, setBlogContent } = useTravelContext();

  // location.state에서 프로젝트 ID 및 선택된 엽서 정보 수신
  const { selectedPostcard, projectId } = (location.state as {
    selectedPostcard?: { id: number; url: string };
    projectId?: number;
  }) || {};

  // 임시로 blogContent를 편집할 수 있도록 tempContent 사용
  const [tempContent, setTempContent] = useState(blogContent || "");
  const [error, setError] = useState("");

  // textarea 변경 처리
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
  };

  // 최종 저장 -> project_blog 엔드포인트로 전송
  const handleSave = async () => {
    try {
      setError("");

      // 1) TravelContext에 최종 내용 반영
      setBlogContent(tempContent);

      // 2) 백엔드에 FormData(파일) 형태로 전송
      if (projectId) {
        const formData = new FormData();
        const blob = new Blob([tempContent], { type: "text/plain" });
        formData.append("input", blob, "blog.txt");

        await apiFetch(`/projects/${projectId}/project_blog`, {
          method: "POST",
          body: formData,
        });

        // 3) 상태를 5로 업데이트
        await apiFetch(`/projects/${projectId}/status?status=5`, {
          method: "POST",
        });
      }

      alert("블로그가 저장되었습니다!");
      navigate("/storage");
    } catch (err: any) {
      console.error("블로그 저장 실패:", err);
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">생성된 여행 블로그</h1>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-2 rounded">
            에러 발생: {error}
          </p>
        )}

        {/* 선택된 엽서 미리보기 */}
        {selectedPostcard && (
          <div className="flex items-center justify-center">
            <div className="w-60 h-60 rounded-lg overflow-hidden shadow-lg border border-gray-300">
              <img
                src={selectedPostcard.url}
                alt={`Postcard ${selectedPostcard.id}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 블로그 작성 textarea */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">블로그 내용 작성</h2>
          <textarea
            className="w-full h-48 md:h-56 border border-gray-300 rounded-lg px-4 py-3 
                       text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent resize-none shadow-sm"
            value={tempContent}
            onChange={handleContentChange}
            placeholder="블로그 내용을 작성하세요..."
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg 
                         shadow-md transition duration-200"
              onClick={handleSave}
            >
              저장하기
            </button>
          </div>
        </div>

        {/* 블로그 미리보기 */}
        {tempContent && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              블로그 미리보기
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {tempContent}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default BlogContentPage;


// // src/components/BlogContentPage.tsx
// import React, { useState, ChangeEvent } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function BlogContentPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { blogContent, setBlogContent } = useTravelContext();

//   // location.state에서 프로젝트 ID 및 선택된 엽서 정보 수신
//   const { selectedPostcard, projectId } = (location.state as {
//     selectedPostcard?: { id: number; url: string };
//     projectId?: number;
//   }) || {};

//   // 임시로 blogContent를 편집할 수 있도록 tempContent 사용
//   const [tempContent, setTempContent] = useState(blogContent || "");
//   const [error, setError] = useState("");

//   // textarea 변경 처리
//   const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setTempContent(e.target.value);
//   };

//   // 최종 저장 -> project_blog 엔드포인트로 전송
//   const handleSave = async () => {
//     try {
//       setError("");

//       // 1) TravelContext에 최종 내용 반영
//       setBlogContent(tempContent);

//       // 2) 백엔드에 FormData(파일) 형태로 전송
//       if (projectId) {
//         // text/plain이나 text/markdown, text/json 등
//         const formData = new FormData();
//         const blob = new Blob([tempContent], { type: "text/plain" });
//         formData.append("input", blob, "blog.txt");

//         await apiFetch(`/projects/${projectId}/project_blog`, {
//           method: "POST",
//           body: formData,
//         });
//       }

//       alert("블로그가 저장되었습니다!");
//       navigate("/storage");
//     } catch (err: any) {
//       console.error("블로그 저장 실패:", err);
//       setError(err.message);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto p-6 space-y-6">
//         <h1 className="text-3xl font-bold text-gray-800">생성된 여행 블로그</h1>

//         {error && (
//           <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-2 rounded">
//             에러 발생: {error}
//           </p>
//         )}

//         {/* 선택된 엽서 미리보기 */}
//         {selectedPostcard && (
//           <div className="flex items-center justify-center">
//             <div className="w-60 h-60 rounded-lg overflow-hidden shadow-lg border border-gray-300">
//               <img
//                 src={selectedPostcard.url}
//                 alt={`Postcard ${selectedPostcard.id}`}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           </div>
//         )}

//         {/* 블로그 작성 textarea */}
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
//           <h2 className="text-xl font-semibold text-gray-800">블로그 내용 작성</h2>
//           <textarea
//             className="w-full h-48 md:h-56 border border-gray-300 rounded-lg px-4 py-3 
//                        text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
//                        focus:border-transparent resize-none shadow-sm"
//             value={tempContent}
//             onChange={handleContentChange}
//             placeholder="블로그 내용을 작성하세요..."
//           />
//           <div className="flex justify-end">
//             <button
//               className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg 
//                          shadow-md transition duration-200"
//               onClick={handleSave}
//             >
//               저장하기
//             </button>
//           </div>
//         </div>

//         {/* 블로그 미리보기 */}
//         {tempContent && (
//           <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-lg p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               블로그 미리보기
//             </h2>
//             <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
//               {tempContent}
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// export default BlogContentPage;
