// src/context/TravelContext.tsx
import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    Dispatch,
    SetStateAction,
  } from "react";
  
  interface GeneratedPostcard {
    id: number;
    url: string;
  }
  
  interface TravelContextValue {
    photos: File[];
    setPhotos: Dispatch<SetStateAction<File[]>>;
    descriptions: string[];
    setDescriptions: Dispatch<SetStateAction<string[]>>;
    blogContent: string;
    setBlogContent: Dispatch<SetStateAction<string>>;
    generatedPostcards: GeneratedPostcard[];
    setGeneratedPostcards: Dispatch<SetStateAction<GeneratedPostcard[]>>;
  }
  
  const TravelContext = createContext<TravelContextValue | null>(null);
  
  interface TravelProviderProps {
    children: ReactNode;
  }
  
  export function TravelProvider({ children }: TravelProviderProps) {
    const [photos, setPhotos] = useState<File[]>([]);
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [blogContent, setBlogContent] = useState<string>("");
    const [generatedPostcards, setGeneratedPostcards] = useState<
      GeneratedPostcard[]
    >([]);
  
    const value: TravelContextValue = {
      photos,
      setPhotos,
      descriptions,
      setDescriptions,
      blogContent,
      setBlogContent,
      generatedPostcards,
      setGeneratedPostcards,
    };
  
    return (
      <TravelContext.Provider value={value}>
        {children}
      </TravelContext.Provider>
    );
  }
  
  export function useTravelContext() {
    const context = useContext(TravelContext);
    if (!context) {
      throw new Error("useTravelContext must be used within a TravelProvider");
    }
    return context;
  }
  