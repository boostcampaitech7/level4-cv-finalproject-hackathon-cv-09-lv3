// src/context/TokenContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

/** TokenContext에서 제공할 값의 타입 정의 */
interface TokenContextValue {
  token: string | null;
  setToken: (tok: string | null) => void;
}

/** Context 생성 (초기값 = null) */
const TokenContext = createContext<TokenContextValue | null>(null);

/**
 * TokenProvider:
 *  - 초기 토큰 값을 localStorage에서 가져와 state에 보관
 *  - setToken()으로 토큰을 수정할 때, localStorage에도 반영
 */
export function TokenProvider({ children }: { children: ReactNode }) {
  // 애플리케이션 시작 시 localStorage에서 토큰 로드
  const [tokenState, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );

  // 토큰을 설정/해제하는 함수
  function setToken(newToken: string | null) {
    if (newToken) {
      // 로그인 시 토큰 저장
      localStorage.setItem("token", newToken);
      setTokenState(newToken);
    } else {
      // 로그아웃 시 토큰 삭제
      localStorage.removeItem("token");
      setTokenState(null);
    }
  }

  const value: TokenContextValue = {
    token: tokenState,
    setToken,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

/** TokenContext 사용을 쉽게 해주는 커스텀 훅 */
export function useToken() {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return ctx;
}
