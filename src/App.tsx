// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/AppRouter";
import { TravelProvider } from "./context/TravelContext";
import { TokenProvider } from "./context/TokenContext";

function App() {
  return (
    <BrowserRouter>
      {/* TokenProvider로 감싸서 JWT 토큰 상태를 전역 관리 */}
      <TokenProvider>
        <TravelProvider>
          <AppRouter />
        </TravelProvider>
      </TokenProvider>
    </BrowserRouter>
  );
}

export default App;
