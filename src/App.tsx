// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/AppRouter";
import { TravelProvider } from "./context/TravelContext";

function App() {
  return (
    <BrowserRouter>
      <TravelProvider>
        <AppRouter />
      </TravelProvider>
    </BrowserRouter>
  );
}

export default App;
