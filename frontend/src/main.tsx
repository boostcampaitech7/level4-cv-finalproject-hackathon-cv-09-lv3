// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Tailwind import ( @tailwind base; @tailwind components; @tailwind utilities; )

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />
);
