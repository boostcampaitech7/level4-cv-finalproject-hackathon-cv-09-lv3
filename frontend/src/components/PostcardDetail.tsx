import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { apiFetch } from "../api";  // JWT 포함 fetch 래퍼

interface Postcard {
  id: number;
  title: string;
  content: string;
  imageurl: string;
}

function PostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postcardData, setPostcardData] = useState<Postcard | null>(null);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleShowContent = () => setShowContent(true);
  const handleShowImage = () => setShowContent(false);

  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "postcard.png"; // 다운로드될 파일명
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    async function fetchPostcard() {
      if (!id) return;
      try {
        setError("");
        const data = await apiFetch(`/projects/${id}`);
        const image = await apiFetch(`/projects/${id}/project_postcard`);
        const imageUrl = URL.createObjectURL(image);
        const blogJson = await apiFetch(`/projects/${id}/project_blog_re`);

        let formattedContent = (blogJson.result || "").replace(/^"|"$/g, '');
        
        // 이미지 태그 변환
        formattedContent = await replaceImageTags(formattedContent, id);
        // 줄바꿈 변환
        // 제목 강조
        formattedContent = formattedContent.replace(/^제목: (.*?)\\n/, '<h1 class="text-2xl font-bold">$1</h1>\n');
        formattedContent = formattedContent.replace(/\\n/g, "<br />");


        setPostcardData({
          id: data.id,
          title: data.name || "제목 없음",
          content: formattedContent,
          imageurl: imageUrl
        });
      } catch (err: any) {
        console.error("프로젝트 상세 조회 실패:", err);
        setError(err.message);
      }
    }
    fetchPostcard();
  }, [id]);

  async function replaceImageTags(content: string, projectId: string): Promise<string> {
    const imageRegex = /<([^<>]+)>/g;
    const matches = [...content.matchAll(imageRegex)]; // 모든 매칭된 이미지명 찾기
  
    const replacements = await Promise.all(
      matches.map(async ([fullMatch, imageName]) => {
        try {
          const imageBlob = await apiFetch(`/projects/${projectId}/${imageName}/image`);
          const imageUrl = URL.createObjectURL(imageBlob);
          return { fullMatch, replacement: `<img src='${imageUrl}' alt='${imageName}' />` };
        } catch (error) {
          console.error(`이미지 로드 실패: ${imageName}`, error);
          return { fullMatch, replacement: `<span class='text-red-500'>[이미지 로드 실패: ${imageName}]</span>` };
        }
      })
    );
  
    // 모든 매칭된 이미지 태그를 비동기 변환된 값으로 치환
    let updatedContent = content;
    replacements.forEach(({ fullMatch, replacement }) => {
      updatedContent = updatedContent.replace(fullMatch, replacement);
    });
  
    return updatedContent
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">오류 발생: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!postcardData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        {!showContent ? (
          <div className="relative w-[1050px] h-[750px] flex justify-center items-center">
            <div className="absolute w-full h-full bg-white border border-gray-300 rounded-lg shadow-2xl rotate-[-5deg]"></div>
            <div className="relative w-[960px] h-[660px] bg-white border border-gray-400 rounded-lg shadow-lg rotate-[2deg] overflow-hidden flex justify-center items-center">
              {!isLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"></div>
              )}
              <img
                src={postcardData.imageurl}
                alt="Postcard"
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setIsLoaded(true)}
              />
            </div>
            <div className="absolute bottom-[-50px] right-[-20px] flex space-x-6">
              <button
                onClick={handleShowContent}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                글 보기
              </button>
              <button
                onClick={() => downloadImage(postcardData.imageurl)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                다운로드
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[800px] bg-white p-6 rounded-lg shadow-md">
            <div
              className="text-gray-700 text-lg text-center mb-6 space-y-4"
              dangerouslySetInnerHTML={{ __html: postcardData.content }}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate(`/postcard/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                수정하기
              </button>
              <button
                onClick={async () => {
                  await apiFetch(`/projects/${id}`, { method: "DELETE" });
                  alert("엽서가 삭제되었습니다.");
                  navigate("/storage");
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                삭제하기
              </button>
              <button
                onClick={handleShowImage}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors shadow-md"
              >
                사진 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PostcardDetail;
