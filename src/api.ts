// src/api.ts
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://e65b-223-130-141-5.ngrok-free.app/api";

/** 토큰이 있으면 Authorization 헤더를 자동으로 붙여주는 fetch 래퍼 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem("token");

  // 1) 기존 options.headers를 new Headers()로 래핑
  const initHeaders = new Headers(options.headers || {});

  // 2) JWT 토큰
  if (token) {
    initHeaders.set("Authorization", `Bearer ${token}`);
  }

  // 3) ngrok 경고 페이지 스킵 헤더 추가
  initHeaders.set("ngrok-skip-browser-warning", "69420");

  // 최종 RequestInit
  const finalOptions: RequestInit = {
    ...options,
    headers: initHeaders,
  };

  const response = await fetch(`${BASE_URL}${url}`, finalOptions);

  // 상태코드 확인
  if (!response.ok) {
    // 실패 시, 그래도 text로 파싱해 더 자세한 정보를 확인할 수 있음
    const errorText = await response.text().catch(() => "");
    throw new Error(`API Error (${response.status}):\n${errorText}`);
  }

  // 응답 Content-Type 체크
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    // JSON 응답
    return response.json();
  } else {
    // HTML 등 다른 형식
    const textData = await response.text();
    throw new Error(`서버가 JSON이 아닌 응답을 보냈습니다:\n${textData.slice(0, 200)}`);
  }
}
