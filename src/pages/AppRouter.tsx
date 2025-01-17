// src/pages/AppRouter.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import PostcardStorage from "../components/PostcardStorage";
import PostcardDetail from "../components/PostcardDetail";
import PostcardEdit from "../components/PostcardEdit";
import PhotoUpload from "../components/PhotoUpload";
import PhotoDescription from "../components/PhotoDescription";
import LoadingBlogCreation from "../components/LoadingBlogCreation";
import PostcardSelection from "../components/PostcardSelection";
import BlogContentPage from "../components/BlogContentPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/storage" element={<PostcardStorage />} />
      <Route path="/postcard/:id" element={<PostcardDetail />} />
      <Route path="/postcard/:id/edit" element={<PostcardEdit />} />      
      <Route path="/upload" element={<PhotoUpload />} />
      <Route path="/description" element={<PhotoDescription />} />
      <Route path="/loading" element={<LoadingBlogCreation />} />
      <Route path="/postcard-selection" element={<PostcardSelection />} />
      <Route path="/blog-content" element={<BlogContentPage />} />
    </Routes>
  );
}

export default AppRouter;
