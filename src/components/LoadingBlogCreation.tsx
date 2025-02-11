// /data/ephemeral/home/travelog/src/components/LoadingBlogCreation.tsx
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
    let socket: WebSocket | null = null;

    const connectWebSocket = () => {
      const wsUrl = `https://6263-223-130-141-5.ngrok-free.app/ws/${projectId}/status`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket 연결됨");
        startPrediction();
      };

      socket.onmessage = async (event) => {
        const message = event.data;
        console.log("서버로부터 메시지 수신:", message);

        if (message === "finish") {
          if (socket) {
            socket.close();
            socket = null;
          }
          await fetchBlogAndMove();
        }

        if (message === "failed") {
          setError("AI 모델 추론이 실패했습니다.");
          setLoading(false);
          if (socket) {
            socket.close();
            socket = null;
          }
        }
      };

      socket.onclose = () => {
        console.log("WebSocket 연결 종료됨");
      };

      socket.onerror = (error) => {
        console.error("WebSocket 에러 발생:", error);
        setError("WebSocket 에러가 발생했습니다.");
        setLoading(false);
      };
    };

    const startPrediction = async () => {
      try {
        setError(null);
        const predictResponse = await apiFetch(`/inference/${projectId}/predict`, {
          method: "POST",
        });
        if (predictResponse.status !== "Task started") {
          throw new Error("추론 시작 요청 실패: " + predictResponse.status);
        }
        console.log("추론 요청 전송 성공");
      } catch (err: any) {
        console.error("추론 요청 에러:", err);
        setError(err.message ?? "추론 요청 중 에러가 발생했습니다.");
        setLoading(false);
      }
    };

    // 결과를 가져오고 이동 (상태를 3으로 업데이트하고 /stamp-checker로 이동)
    const fetchBlogAndMove = async () => {
      try {
        const result = await apiFetch(`/projects/${projectId}/project_blog`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        setBlogContent(result.result || "");
        setGeneratedPostcards(
          result.image.map((url: string, index: number) => ({
            id: index + 1,
            url,
          }))
        );

        // 상태 업데이트: 상태를 "3"로 변경
        await apiFetch(`/projects/${projectId}/status?status=3`, {
          method: "POST",
        });

        setLoading(false);
        // /stamp-checker로 이동
        navigate("/stamp-checker", { state: { projectId } });
      } catch (err: any) {
        setError(err.message ?? "결과 가져오기 중 에러가 발생했습니다.");
        setLoading(false);
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
        socket = null;
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
//     let socket: WebSocket | null = null;

//     // WebSocket 연결
//     const connectWebSocket = () => {
//       const wsUrl = `https://6263-223-130-141-5.ngrok-free.app/ws/${projectId}/status`;
//       socket = new WebSocket(wsUrl);

//       socket.onopen = () => {
//         console.log("WebSocket 연결됨");
//         startPrediction(); // WebSocket 연결 후 추론 요청 전송
//       };

//       socket.onmessage = async (event) => {
//         const message = event.data;
//         console.log("서버로부터 메시지 수신:", message);

//         if (message === "finish") {
//           if (socket) {
//             socket.close(); // WebSocket 연결 종료
//             socket = null;
//           }
//           await fetchBlogAndMove(); // 결과를 가져오고 이동
//         }

//         if (message === "failed") {
//           setError("AI 모델 추론이 실패했습니다.");
//           setLoading(false);
//           if (socket) {
//             socket.close(); // WebSocket 연결 종료
//             socket = null;
//           }
//         }
//       };

//       socket.onclose = () => {
//         console.log("WebSocket 연결 종료됨");
//       };

//       socket.onerror = (error) => {
//         console.error("WebSocket 에러 발생:", error);
//         setError("WebSocket 에러가 발생했습니다.");
//         setLoading(false);
//       };
//     };

//     // 추론 요청 전송
//     const startPrediction = async () => {
//       try {
//         setError(null);

//         const predictResponse = await apiFetch(`/inference/${projectId}/predict`, {
//           method: "POST",
//         });

//         if (predictResponse.status !== "Task started") {
//           throw new Error("추론 시작 요청 실패: " + predictResponse.status);
//         }

//         console.log("추론 요청 전송 성공");
//       } catch (err: any) {
//         console.error("추론 요청 에러:", err);
//         setError(err.message ?? "추론 요청 중 에러가 발생했습니다.");
//         setLoading(false);
//       }
//     };

//     // 결과를 가져오고 이동
//     const fetchBlogAndMove = async () => {
//       try {
//         const result = await apiFetch(`/projects/${projectId}/project_blog`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });

//         // 결과를 상태에 저장
//         setBlogContent(result.result || "");
//         setGeneratedPostcards(
//           result.image.map((url: string, index: number) => ({
//             id: index + 1,
//             url,
//           }))
//         );

//         // 상태 업데이트: 상태를 3로 변경
//         await apiFetch(`/projects/${projectId}/status?status=3`, {
//           method: "POST",
//         });

//         // 엽서 선택 화면으로 이동
//         setLoading(false);
//         navigate("/postcard-selection", { state: { projectId } });
//       } catch (err: any) {
//         setError(err.message ?? "결과 가져오기 중 에러가 발생했습니다.");
//         setLoading(false);
//       }
//     };

//     // WebSocket 연결 시작
//     connectWebSocket();

//     // 컴포넌트 언마운트 시 WebSocket 정리
//     return () => {
//       if (socket) {
//         socket.close();
//         socket = null;
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
//           <p className="text-gray-600">AI가 열심히 글을 쓰고 있어요! 잠시만 기다려 주세요.</p>
//         )}
//         {loading && (
//           <iframe
//             src="https://lottie.host/embed/28208973-b6ab-41cc-a045-a843eae76d93/VZeY5TcfdA.lottie"
//             className="w-32 h-32"
//           />
//         )}
//       </div>
//     </Layout>
//   );
// }

// export default LoadingBlogCreation;

