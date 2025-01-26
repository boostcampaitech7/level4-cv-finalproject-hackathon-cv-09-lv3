import React from "react";
import { useNavigate } from "react-router-dom";
import { useTravelContext } from "../context/TravelContext";
import Layout from "./Layout";

function PostcardSelection() {
  const navigate = useNavigate();
  const { generatedPostcards } = useTravelContext();

  const handleSelectCard = (id: number, url: string) => {
    navigate("/blog-content", {
      state: { selectedPostcard: { id, url } },
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          엽서를 선택해 보세요!
        </h1>
      </div>

      {/* 엽서 카드 배열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {generatedPostcards.map((pc) => (
          <div
            key={pc.id}
            className="relative bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleSelectCard(pc.id, pc.url)}
          >
            {/* 엽서 이미지 */}
            <div className="aspect-square">
              <img
                src={pc.url}
                alt={`Postcard ${pc.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 엽서 ID 표시 */}
            <div className="absolute bottom-0 w-full bg-white bg-opacity-80 py-2 text-center">
              <p className="text-sm font-semibold text-gray-800">엽서 {pc.id}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default PostcardSelection;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useTravelContext } from "../context/TravelContext";
// import Layout from "./Layout";

// function PostcardSelection() {
//   const navigate = useNavigate();
//   const { generatedPostcards } = useTravelContext();

//   const handleSelectCard = (id: number, url: string) => {
//     // 선택한 엽서를 블로그 작성 페이지로 전달
//     navigate("/blog-content", {
//       state: { selectedPostcard: { id, url } },
//     });
//   };

//   return (
//     <Layout>
//       <h1 className="text-2xl font-bold mb-6">엽서를 선택해 보세요!</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {generatedPostcards.map((pc) => (
//           <div
//             key={pc.id}
//             className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
//             onClick={() => handleSelectCard(pc.id, pc.url)}
//           >
//             <img
//               src={pc.url}
//               alt={`Postcard ${pc.id}`}
//               className="mx-auto mb-2 w-full h-40 object-cover"
//             />
//             <p className="font-semibold text-gray-700">엽서 {pc.id}</p>
//           </div>
//         ))}
//       </div>
//     </Layout>
//   );
// }

// export default PostcardSelection;
