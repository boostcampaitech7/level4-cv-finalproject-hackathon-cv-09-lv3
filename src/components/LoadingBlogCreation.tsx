import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";
import { apiFetch } from "../api";

function LoadingBlogCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = (location.state as { projectId: number }) || {};

  const { setBlogContent, setGeneratedPostcards } = useTravelContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: number | null = null;

    async function startPrediction() {
      try {
        setError(null);

        // 1) 추론 요청 전송
        const predictResponse = await apiFetch(`/inference/${projectId}/predict`, {
          method: "POST",
        });

        if (predictResponse.status !== "Task started") {
          throw new Error("추론 시작 요청 실패: " + predictResponse.status);
        }

        // 2) 추론 상태 확인 (주기적으로)
        intervalId = window.setInterval(async () => {
          try {
            const statusResponse = await apiFetch(`/inference/${projectId}/status`, {
              method: "GET",
            });

            console.log("Status Check:", statusResponse); // 디버깅용 로그 출력

            if (statusResponse.status === "completed") {
              clearInterval(intervalId!);
              intervalId = null;

              // 3) 추론 결과 파일 가져오기
              const result = await apiFetch(`/projects/${projectId}/project_blog`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });

              // 결과를 상태에 저장
              setBlogContent(result.result || "");
              setGeneratedPostcards(
                result.image.map((url: string, index: number) => ({
                  id: index + 1,
                  url,
                }))
              );

              // 엽서 선택 화면으로 이동
              setLoading(false);
              navigate("/postcard-selection", { state: { projectId } });
            } else if (statusResponse.status === "failed") {
              clearInterval(intervalId!);
              intervalId = null;
              setError("AI 모델 추론이 실패했습니다.");
              setLoading(false);
            }
          } catch (err: any) {
            clearInterval(intervalId!);
            intervalId = null;
            setError(err.message ?? "상태 확인 중 에러가 발생했습니다.");
            setLoading(false);
          }
        }, 100000);
      } catch (err: any) {
        setError(err.message ?? "추론 요청 중 에러가 발생했습니다.");
        setLoading(false);
      }
    }

    startPrediction();

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [navigate, projectId, setBlogContent, setGeneratedPostcards]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white border border-gray-200 rounded-md p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">여행 블로그 작성 중...</h1>
        {error ? (
          <p className="text-red-500">에러 발생: {error}</p>
        ) : (
          <p className="text-gray-600">AI가 열심히 글을 쓰고 있어요! 잠시만 기다려 주세요.</p>
        )}
        {loading && (
          <iframe
            src="https://lottie.host/embed/28208973-b6ab-41cc-a045-a843eae76d93/VZeY5TcfdA.lottie"
            className="w-32 h-32"
          />
        )}
      </div>
    </Layout>
  );
}

export default LoadingBlogCreation;


// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";
// import { apiFetch } from "../api";

// function LoadingBlogCreation() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { projectId } = (location.state as { projectId: number }) || {};

//   const { setBlogContent, setGeneratedPostcards } = useTravelContext();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let intervalId: number | null = null;

//     async function startPrediction() {
//       try {
//         setError(null);

//         // 1) 추론 요청 전송
//         const predictResponse = await apiFetch(`/inference/${projectId}/predict`, {
//           method: "POST",
//         });

//         if (predictResponse.status !== "Task started") {
//           throw new Error("추론 시작 요청 실패: " + predictResponse.status);
//         }

//         // 2) 추론 상태 확인 (주기적으로)
//         intervalId = window.setInterval(async () => {
//           try {
//             const statusResponse = await apiFetch(`/inference/${projectId}/status`, {
//               method: "GET",
//             });

//             console.log("Status Check:", statusResponse); // 디버깅용 로그 출력

//             if (statusResponse.status === "completed") {
//               // 상태가 completed이면 결과 받아오고 이동
//               clearInterval(intervalId!); // 상태 확인 중지
//               intervalId = null;

//               // 3) 추론 결과 파일 가져오기
//               const result = await apiFetch(`/projects/${projectId}/project_blog`, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//               });

//               // 예상 결과: { postcards: [{ id, url }], blogDraft: "..." }
//               setBlogContent(result.blogDraft || "");
//               setGeneratedPostcards(result.postcards || []);

//               // 4) 엽서 선택 화면으로 이동
//               setLoading(false);
//               navigate("/postcard-selection");
//             } else if (statusResponse.status === "failed") {
//               clearInterval(intervalId!); // 상태 확인 중지
//               intervalId = null;
//               setError("AI 모델 추론이 실패했습니다.");
//               setLoading(false);
//             }
//           } catch (err: any) {
//             clearInterval(intervalId!); // 상태 확인 중지
//             intervalId = null;
//             setError(err.message ?? "상태 확인 중 에러가 발생했습니다.");
//             setLoading(false);
//           }
//         }, 100000); // 5초 간격으로 상태 확인
//       } catch (err: any) {
//         setError(err.message ?? "추론 요청 중 에러가 발생했습니다.");
//         setLoading(false);
//       }
//     }

//     startPrediction();

//     // 컴포넌트 언마운트 시 인터벌 정리
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [navigate, projectId, setBlogContent, setGeneratedPostcards]);

//   return (
//     <Layout>
//       <div className="flex flex-col items-center justify-center h-[70vh] bg-white border border-gray-200 rounded-md p-8 shadow-sm">
//         <h1 className="text-2xl font-bold mb-4">여행 블로그 작성 중...</h1>
//         {error ? (
//           <p className="text-red-500">에러 발생: {error}</p>
//         ) : (
//           <p className="text-gray-600">
//             AI가 열심히 글을 쓰고 있어요! 잠시만 기다려 주세요.
//           </p>
//         )}
//         <iframe src="https://lottie.host/embed/28208973-b6ab-41cc-a045-a843eae76d93/VZeY5TcfdA.lottie"></iframe>
//         {/* 로딩 스피너 추가 가능 */}
//       </div>
//     </Layout>
//   );
// }

// export default LoadingBlogCreation;

