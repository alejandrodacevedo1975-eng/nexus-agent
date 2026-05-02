import { useState } from "react";

export type ResultType = "text" | "code" | "search" | "slides";

export interface ResultData {
  type: ResultType;
  content: string | any;
  title?: string;
}

export function useSuggestionHandler() {
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const detectSuggestionType = (command: string): ResultType => {
    const lowerCommand = command.toLowerCase();

    if (
      lowerCommand.includes("investigar") ||
      lowerCommand.includes("buscar") ||
      lowerCommand.includes("search")
    ) {
      return "search";
    }

    if (
      lowerCommand.includes("código") ||
      lowerCommand.includes("code") ||
      lowerCommand.includes("escribir código") ||
      lowerCommand.includes("programar")
    ) {
      return "code";
    }

    if (
      lowerCommand.includes("diapositivas") ||
      lowerCommand.includes("slides") ||
      lowerCommand.includes("presentación") ||
      lowerCommand.includes("crear diapositivas")
    ) {
      return "slides";
    }

    return "text";
  };

  const handleSearchResults = (query: string, results: any[]) => {
    setResultData({
      type: "search",
      content: results,
      title: `Resultados para: ${query}`,
    });
  };

  const handleCodeResult = (code: string, language: string = "javascript") => {
    setResultData({
      type: "code",
      content: { code, language },
      title: "Código",
    });
  };

  const handleSlidesGeneration = (slides: any[]) => {
    setResultData({
      type: "slides",
      content: slides,
      title: "Presentación",
    });
  };

  return {
    resultData,
    setResultData,
    detectSuggestionType,
    handleSearchResults,
    handleCodeResult,
    handleSlidesGeneration,
  };
}
