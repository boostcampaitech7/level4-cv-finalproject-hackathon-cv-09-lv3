// BlogContentPage.tsx
import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";

interface SelectedPostcard {
  id: number;
  url: string;
}

function BlogContentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state에서 프로젝트 ID 및 선택된 엽서 URL 수신
  const { selectedPostcard, projectId } = (location.state as {
    selectedPostcard?: SelectedPostcard;
    projectId?: number;
  }) || {};

  // 서버에서 불러온 title/ content
  const [title, setTitle] = useState("");
  const [tempContent, setTempContent] = useState("");
  const [error, setError] = useState("");

  // 엽서 이미지(선택된 것 or 백엔드에서 불러온 것)
  const [postcardUrl, setPostcardUrl] = useState<string | null>(
    selectedPostcard?.url || null
  );

  // 문체 변경 모달 상태
  const [showToneModal, setShowToneModal] = useState(false);
  const [selectedTone, setSelectedTone] = useState("");

  /**
   * 1) 페이지 진입 시, 백엔드에서 프로젝트/블로그/엽서 데이터 불러오기
   *    - PostcardEdit.tsx의 방식 참고
   */
  useEffect(() => {
    if (!projectId) return;

    async function fetchData() {
      try {
        setError("");
        // 1) /projects/{id} => { id, name, status, ... }
        const projectData = await apiFetch(`/projects/${projectId}`);
        // 2) /projects/{id}/project_blog => 블로그 텍스트 (예: { result: "..." })
        const blogJson = await apiFetch(`/projects/${projectId}/project_blog`);

        // projectData.name -> 제목
        const blogContent = blogJson.result || "";

        setTitle(projectData.name || "제목 없음");
        setTempContent(blogContent);

        // 3) /projects/{id}/project_postcard => 엽서 이미지 blob
        //    단, selectedPostcard.url이 이미 있으면 안 불러와도 되지만,
        //    여기서는 항상 다시 불러온다고 가정
        try {
          const imageBlob = await apiFetch(`/projects/${projectId}/project_postcard`, {
            method: "GET",
            // responseType: "blob", // apiFetch 내부 구현에 따라 다를 수 있음
          });
          const imageUrl = URL.createObjectURL(imageBlob);
          setPostcardUrl(imageUrl);
        } catch (err) {
          // 아직 엽서가 없을 수 있으므로 에러 무시 가능
          console.error("엽서 이미지 불러오기 실패:", err);
        }
      } catch (err: any) {
        console.error("블로그 내용 불러오기 실패:", err);
        setError("블로그 내용을 불러오지 못했습니다.");
      }
    }

    fetchData();
  }, [projectId]);

  /**
   * 2) textarea 변경 처리
   */
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
  };

  /**
   * 3) 최종 저장 -> project_blog 엔드포인트로 전송 + 상태 업데이트
   */
  const handleSave = async () => {
    if (!projectId) return;
    try {
      setError("");
      // 블로그 파일 업로드
      const formData = new FormData();
      const jsonData = JSON.stringify({ result: tempContent });
      const blob = new Blob([jsonData], { type: "application/json" });
      formData.append("input", blob, "blog.json");

      await apiFetch(`/projects/${projectId}/project_blog`, {
        method: "POST",
        body: formData,
      });

      // 상태를 6(완료)로 변경
      await apiFetch(`/projects/${projectId}/status?status=6`, {
        method: "POST",
      });

      alert("블로그가 저장되었고, 최종 완료되었습니다!");
      navigate(`/postcard/${projectId}`);
    } catch (err: any) {
      console.error("블로그 저장 실패:", err);
      setError(err.message);
    }
  };

  /**
   * 4) 문체 변경 기능
   *    - PostcardEdit.tsx의 handleToneChangeBlog() 참고
   */
  const handleToneChangeBlog = async () => {
    if (!projectId) return;
    try {
      setError("");

      // selectedTone에 따라 API 파라미터 달리할 수도 있음. 예시:
      // "귀여운 말투" => modify?input=cute
      // "화난 말투"  => modify?input=angry
      // "정보전달 말투" => modify?input=informative
      // 여기서는 간단히 한글로 switch
      let inputTone = "";
      if (selectedTone === "귀여운 말투") inputTone = "cute";
      else if (selectedTone === "화난 말투") inputTone = "angry";
      else if (selectedTone === "정보전달 말투") inputTone = "info";

      // 1) AI에게 문체 변경 요청
      await apiFetch(`/inference/${projectId}/modify?input=${encodeURIComponent(inputTone)}`, {
        method: "POST",
      });

      // 2) 변경된 블로그 내용 재조회
      const blogJson = await apiFetch(`/projects/${projectId}/project_blog`);
      setTempContent(blogJson.result || "");

      // 모달 닫기
      setShowToneModal(false);
      alert("문체 변경이 완료되었습니다!");
    } catch (err: any) {
      console.error("문체 변경 실패:", err);
      setError(err.message || "문체 변경 중 오류 발생");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          AI로 생성된 여행 블로그 (State 5 단계)
        </h1>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-2 rounded">
            에러 발생: {error}
          </p>
        )}

        {/* 엽서 미리보기 */}
        {postcardUrl && (
          <div className="flex items-center justify-center">
            <div className="w-60 h-60 rounded-lg overflow-hidden shadow-lg border border-gray-300">
              <img
                src={postcardUrl}
                alt={`Postcard ${projectId}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 블로그 작성 textarea */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            블로그 내용 수정 (초안)
          </h2>
          <textarea
            className="w-full h-48 md:h-56 border border-gray-300 rounded-lg px-4 py-3 
                       text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent resize-none shadow-sm"
            value={tempContent}
            onChange={handleContentChange}
            placeholder="AI가 생성한 블로그 초안을 수정해 보세요..."
          />
          <div className="flex space-x-4 justify-end">
            {/* <button
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              onClick={() => setShowToneModal(true)}
            >
              문체 바꾸기
            </button> */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg 
                         shadow-md transition duration-200"
              onClick={handleSave}
            >
              최종 저장 (완료)
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

      {/* 문체 선택 모달 */}
      {showToneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">문체 선택</h2>
            <div className="space-y-2">
              {["귀여운 말투", "화난 말투", "정보전달 말투"].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`w-full py-2 px-4 rounded text-center ${
                    selectedTone === tone
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleToneChangeBlog}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                진행하기
              </button>
              <button
                onClick={() => setShowToneModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
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
