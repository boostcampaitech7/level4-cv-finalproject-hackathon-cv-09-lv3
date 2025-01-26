// src/components/PostcardStorage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";

interface Postcard {
  id: number;
  title: string;
}

/**
 * 백엔드:
 *  - GET /projects => 로그인 사용자(JWT) 소유 프로젝트(엽서) 목록
 *  - (기존) PUT /projects 로 프로젝트 생성은 PhotoUpload.tsx에서 수행
 */
function PostcardStorage() {
  const navigate = useNavigate();
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [error, setError] = useState("");

  // 사용자별 프로젝트 목록 가져오기
  useEffect(() => {
    async function fetchMyPostcards() {
      try {
        setError("");
        // GET /projects
        const data = await apiFetch("/projects");
        // data = [{ id, name, ... }, ...]
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.name || "제목 없음",
        }));
        setPostcards(mapped);
      } catch (err: any) {
        console.error("프로젝트 목록 불러오기 실패:", err);

        // 토큰이 invalid하거나 expired인 경우
        if (err.message.includes("Invalid token") || err.message.includes("expired token")) {
          // 로그인 페이지로 리다이렉트
          navigate("/");
        } else {
          setError(err.message);
        }
      }
    }
    fetchMyPostcards();
  }, [navigate]);

  // "새로운 블로그 작성" => "/upload"로 이동
  // 실제 프로젝트 생성은 PhotoUpload.tsx에서 (파일 업로드 + PUT /projects)
  const handleCreateBlog = () => {
    navigate("/upload");
  };

  const handleSelectPostcard = (id: number) => {
    // 보관함의 엽서를 클릭 -> 상세 페이지로
    navigate(`/postcard/${id}`);
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

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {postcards.map((pc) => (
          <li
            key={pc.id}
            className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSelectPostcard(pc.id)}
          >
            <h2 className="text-lg font-bold text-gray-700 mb-1">{pc.title}</h2>
            <p className="text-sm text-gray-500">자세히 보려면 클릭하세요.</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export default PostcardStorage;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// interface Postcard {
//   id: number;
//   title: string;
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

//   // 사용자별 프로젝트 목록 가져오기
//   useEffect(() => {
//     async function fetchMyPostcards() {
//       try {
//         setError("");
//         // GET /projects
//         const data = await apiFetch("/projects");
//         // data = [{ id, name, ... }, ...]
//         const mapped = data.map((item: any) => ({
//           id: item.id,
//           title: item.name || "제목 없음",
//         }));
//         setPostcards(mapped);
//       } catch (err: any) {
//         console.error("프로젝트 목록 불러오기 실패:", err);
//         setError(err.message);
//       }
//     }
//     fetchMyPostcards();
//   }, []);

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

//       <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
//         {postcards.map((pc) => (
//           <li
//             key={pc.id}
//             className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
//             onClick={() => handleSelectPostcard(pc.id)}
//           >
//             <h2 className="text-lg font-bold text-gray-700 mb-1">{pc.title}</h2>
//             <p className="text-sm text-gray-500">자세히 보려면 클릭하세요.</p>
//           </li>
//         ))}
//       </ul>
//     </Layout>
//   );
// }

// export default PostcardStorage;
