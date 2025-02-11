import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";

interface Postcard {
  id: number;
  title: string;
  stampImage: string;
}

function PostcardStorage() {
  const navigate = useNavigate();
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(postcards.length / itemsPerPage);

  const currentPostcards = postcards.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    async function fetchMyPostcards() {
      try {
        setError("");
        const data = await apiFetch("/projects");
        const mapped = await Promise.all(
          data.map(async (item: any) => {
            const imageData = await apiFetch(`/projects/${item.id}/project_stamp`);
            const imageUrl = URL.createObjectURL(imageData);
            return {
              id: item.id,
              title: item.name || "제목 없음",
              stampImage: imageUrl,
            };
          })
        );
        setPostcards(mapped);
      } catch (err: any) {
        console.error("프로젝트 목록 불러오기 실패:", err);
        if (err.message.includes("Invalid token") || err.message.includes("expired token")) {
          navigate("/");
        } else {
          setError(err.message);
        }
      }
    }
    fetchMyPostcards();
  }, [navigate]);

  const handleCreateBlog = () => {
    navigate("/upload");
  };

  const handleSelectPostcard = async (id: number) => {
    try {
      const response = await apiFetch(`/projects/${id}`, { method: "GET" });
      const status = response.status;
      const selected = postcards.find((pc) => pc.id === id);

      switch (status) {
        case "1": // 입력 이미지만 받은 상태
          navigate("/description", { state: { projectId: id } });
          break;
        case "2": // 이미지마다 사용자 설명 받은 상태
          navigate("/loading", { state: { projectId: id } });
          break;
        case "3": // 로딩 완료 후, 스탬프 확인 단계
          navigate("/stamp-checker", { state: { projectId: id } });
          break;
        case "4": // 스탬프 확인 후, 엽서 선택 전 단계
          navigate("/postcard-selection", { state: { projectId: id } });
          break;
        case "5": // 스탬프 확인 후, 블로그 글 수정 단계
          navigate("/blog-content", { state: { projectId: id } });
          break;
        case "6": // 최종 완료 상태 (블로그 작성 완료)
          navigate(`/postcard/${id}`);
          break;
        default:
          alert("알 수 없는 상태입니다.");
      }
    } catch (err: any) {
      console.error("상태 확인 실패:", err);
      alert("프로젝트 상태를 확인할 수 없습니다.");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">나의 엽서 보관함</h1>
        <button
          onClick={handleCreateBlog}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          새로운 블로그 작성하기
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="relative w-full min-h-screen bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <ul className="grid grid-cols-3 gap-6">
          {currentPostcards.map((pc) => {
            const randomRotation = Math.random() * 30 - 15;

            return (
              <li key={pc.id} className="relative flex justify-center items-center">
                <div
                  className="w-48 h-48 bg-transparent border-4 border-gray-700 rounded-full shadow-lg cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
                  style={{ transform: `rotate(${randomRotation}deg)` }}
                  onClick={() => handleSelectPostcard(pc.id)}
                >
                  <img
                    src={pc.stampImage}
                    alt="Postcard Stamp"
                    className="w-full h-full object-cover rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between items-center w-full mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
              currentPage === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ◀ 이전
          </button>
          <span className="text-gray-700 font-semibold">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
              currentPage === totalPages - 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            다음 ▶
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PostcardStorage;


// // src/components/PostcardStorage.tsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// interface Postcard {
//   id: number;
//   title: string;
//   stampImage : string
// }

// /**
//  * 백엔드:
//  *  - GET /projects => 로그인 사용자(JWT) 소유 프로젝트(엽서) 목록
//  *  - (기존) PUT /projects 로 프로젝트 생성은 PhotoUpload.tsx에서 수행
//  */
// function PostcardStorage() {
//   const navigate = useNavigate();
//   const [postcards, setPostcards] = useState<Postcard[]>([]);
//   const [error, setError] = useState("");

//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 9; // 한 페이지에 도장 9개

//   const totalPages = Math.ceil(postcards.length / itemsPerPage);

//   const currentPostcards = postcards.slice(
//     currentPage * itemsPerPage,
//     (currentPage + 1) * itemsPerPage
//   );

//   const handlePrevPage = () => {
//     if (currentPage > 0) setCurrentPage(currentPage - 1);
//   };

//   // 다음 페이지로 이동
//   const handleNextPage = () => {
//     if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
//   };

//   // 사용자별 프로젝트 목록 가져오기
//   useEffect(() => {
//     async function fetchMyPostcards() {
//       try {
//         setError("");
//         // GET /projects
//         const data = await apiFetch("/projects");
//         // data = [{ id, name, ... }, ...]
//         const mapped = await Promise.all(data.map(async(item: any) => {
//           const imageData = await apiFetch(`/projects/${item.id}/project_stamp`);
//           const imageUrl = URL.createObjectURL(imageData);
//           return{
//             id: item.id,
//             title: item.name || "제목 없음",
//             stampImage: imageUrl
//         }}));
//         setPostcards(mapped);
//       } catch (err: any) {
//         console.error("프로젝트 목록 불러오기 실패:", err);

//         // 토큰이 invalid하거나 expired인 경우
//         if (err.message.includes("Invalid token") || err.message.includes("expired token")) {
//           // 로그인 페이지로 리다이렉트
//           navigate("/");
//         } else {
//           setError(err.message);
//         }
//       }
//     }
//     fetchMyPostcards();
//   }, [navigate]);

//   // "새로운 블로그 작성" => "/upload"로 이동
//   // 실제 프로젝트 생성은 PhotoUpload.tsx에서 (파일 업로드 + PUT /projects)
//   const handleCreateBlog = () => {
//     navigate("/upload");
//   };

//   const handleSelectPostcard = (id: number) => {
//     // 보관함의 엽서를 클릭 -> 상세 페이지로
//     navigate(`/postcard/${id}`);
//   };

//   return (
//     <Layout>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">나의 엽서 보관함</h1>
//         <button
//           onClick={handleCreateBlog}
//           className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//         >
//           새로운 블로그 작성하기
//         </button>
//       </div>

//       {error && <p className="text-red-500">{error}</p>}

//       {/* 페이지 컨테이너 */}
//       <div className="relative w-full min-h-screen bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center">
//         {/* 도장 목록 (현재 페이지) */}
//         <ul className="grid grid-cols-3 gap-6">
//           {currentPostcards.map((pc) => {
//             const randomRotation = Math.random() * 30 - 15; // -15 ~ +15도 랜덤 회전

//             return (
//               <li key={pc.id} className="relative flex justify-center items-center">
//                 <div
//                   className="w-48 h-48 bg-transparent border-4 border-gray-700 rounded-full shadow-lg cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
//                   style={{ transform: `rotate(${randomRotation}deg)` }} // 랜덤 회전 적용
//                   onClick={() => handleSelectPostcard(pc.id)}
//                 >
//                   <img
//                     src={pc.stampImage}
//                     alt="Postcard Stamp"
//                     className="w-full h-full object-cover rounded-full opacity-90 hover:opacity-100 transition-opacity"
//                   />
//                 </div>
//               </li>
//             );
//           })}
//         </ul>

//         {/* 페이지 네비게이션 */}
//         <div className="flex justify-between items-center w-full mt-6">
//           {/* 이전 페이지 버튼 */}
//           <button
//             onClick={handlePrevPage}
//             disabled={currentPage === 0}
//             className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
//               currentPage === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             ◀ 이전
//           </button>

//           {/* 페이지 번호 표시 */}
//           <span className="text-gray-700 font-semibold">
//             {currentPage + 1} / {totalPages}
//           </span>

//           {/* 다음 페이지 버튼 */}
//           <button
//             onClick={handleNextPage}
//             disabled={currentPage === totalPages - 1}
//             className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
//               currentPage === totalPages - 1
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             다음 ▶
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default PostcardStorage;
