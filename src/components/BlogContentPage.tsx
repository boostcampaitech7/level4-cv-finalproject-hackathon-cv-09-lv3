import React, { useState, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function BlogContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { blogContent, setBlogContent } = useTravelContext();

  const { selectedPostcard, projectId } =
    (location.state as {
      selectedPostcard?: { id: number; url: string }; // 선택된 엽서 정보
      projectId?: number; // 프로젝트 ID
    }) || {};

  const [tempContent, setTempContent] = useState(blogContent || "");
  const [error, setError] = useState("");

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      setError("");
      setBlogContent(tempContent);

      alert("저장되었습니다!");
      navigate("/storage");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 제목 섹션 */}
        <h1 className="text-3xl font-bold text-gray-800">
          생성된 여행 블로그
        </h1>
        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-2 rounded">
            에러 발생: {error}
          </p>
        )}

        {/* 엽서 섹션 */}
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

        {/* 블로그 작성 섹션 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            블로그 내용 작성
          </h2>
          <textarea
            className="w-full h-48 md:h-56 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       resize-none shadow-sm"
            value={tempContent}
            onChange={handleContentChange}
            placeholder="블로그 내용을 작성하세요..."
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md 
                         transition duration-200"
              onClick={handleSave}
            >
              저장하기
            </button>
          </div>
        </div>

        {/* 블로그 미리보기 섹션 */}
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


// import React, { useState, ChangeEvent } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";

// function BlogContentPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { blogContent, setBlogContent } = useTravelContext();

//   // 전달받은 state
//   const { selectedPostcard, projectId } = 
//     (location.state as {
//       selectedPostcard?: { id: number; url: string }; // 선택된 엽서 정보
//       projectId?: number; // 프로젝트 ID
//     }) || {};

//   const [tempContent, setTempContent] = useState(blogContent);
//   const [error, setError] = useState("");

//   const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setTempContent(e.target.value);
//   };

//   const handleSave = async () => {
//     try {
//       setError("");
//       setBlogContent(tempContent);

//       // DB에 저장하는 코드 (주석 처리)
//       /*
//       if (projectId && selectedPostcard) {
//         await apiFetch(`/projects/${projectId}/blog`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             postcardId: selectedPostcard.id,
//             content: tempContent,
//           }),
//         });
//       }
//       */

//       alert("저장되었습니다!");
//       navigate("/storage"); // 저장 후 보관함으로 이동
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <Layout>
//       <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
//         <h1 className="text-2xl font-bold text-gray-800 mb-4">
//           생성된 여행 블로그
//         </h1>
//         {error && <p className="text-red-500 mb-2">에러 발생: {error}</p>}

//         {selectedPostcard && (
//           <div className="mb-4">
//             <p className="text-sm text-gray-500">선택된 엽서:</p>
//             <img
//               src={selectedPostcard.url}
//               alt={`Postcard ${selectedPostcard.id}`}
//               className="w-full h-40 object-cover border border-gray-300 rounded"
//             />
//           </div>
//         )}

//         <textarea
//           className="w-full h-60 border border-gray-300 rounded px-3 py-2 text-gray-700
//                      focus:outline-none focus:ring-2 focus:ring-brand-500"
//           value={tempContent}
//           onChange={handleContentChange}
//         />

//         <div className="flex justify-end mt-4">
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//             onClick={handleSave}
//           >
//             저장하기
//           </button>
//         </div>

//         {tempContent && (
//           <div className="prose mt-8">
//             <h2 className="text-lg font-bold">블로그 미리보기</h2>
//             <p className="text-gray-700 whitespace-pre-wrap">{tempContent}</p>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// export default BlogContentPage;
