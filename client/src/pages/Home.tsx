import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import ManusSuggestionsInput from "@/components/ManusSuggestionsInput";
import SearchResults from "@/components/SearchResults";
import CodeDisplay from "@/components/CodeDisplay";
import SlidesGenerator from "@/components/SlidesGenerator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { searchWeb, detectLanguage, type SearchResult } from "@/lib/searchService";

type ResultType = "text" | "code" | "search" | "slides";

interface ResultData {
  type: ResultType;
  content: any;
  title?: string;
  query?: string;
}

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Cargar tareas del servidor
  const { data: serverTasks } = trpc.agent.getTasks.useQuery(undefined, {
    enabled: !!user,
  });

  const executeCommandMutation = trpc.agent.executeCommand.useMutation({
    onSuccess: (data: any) => {
      setIsLoading(false);
      setProgress(100);

      // Procesar resultado
      try {
        const result = JSON.parse(data.result);
        const resultText = result.result || data.result;
        setResultData({
          type: "text",
          content: resultText,
        });
        setShowResult(true);
      } catch {
        setResultData({
          type: "text",
          content: data.result,
        });
        setShowResult(true);
      }
    },
    onError: (error: any) => {
      setIsLoading(false);
      setProgress(0);
      setResultData({
        type: "text",
        content: `Error: ${error.message}`,
      });
      setShowResult(true);
    },
  });

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

  const handleSubmitCommand = async (command: string) => {
    const taskId = nanoid();
    const suggestionType = detectSuggestionType(command);

    setIsLoading(true);
    setProgress(0);
    setShowResult(false);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
    }, 500);

    try {
      // Manejar búsqueda web
      if (suggestionType === "search") {
        // Extraer query de búsqueda
        const query = command
          .replace(/investigar|buscar|search/gi, "")
          .trim();

        setProgress(50);
        const results = await searchWeb(query);
        setProgress(100);

        setResultData({
          type: "search",
          content: results,
          query: query,
          title: `Resultados para: ${query}`,
        });
        setShowResult(true);
      }
      // Manejar código
      else if (suggestionType === "code") {
        // Ejecutar en backend
        await executeCommandMutation.mutateAsync({
          taskId,
          command,
        });

        // Si el resultado parece código, mostrarlo con syntax highlighting
        if (resultData && resultData.type === "text") {
          const code = resultData.content;
          const language = detectLanguage(code);

          setResultData({
            type: "code",
            content: { code, language },
            title: "Código",
          });
        }
      }
      // Manejar diapositivas
      else if (suggestionType === "slides") {
        // Ejecutar en backend para obtener contenido
        await executeCommandMutation.mutateAsync({
          taskId,
          command,
        });

        // Mostrar generador de diapositivas
        if (resultData && resultData.type === "text") {
          setResultData({
            type: "slides",
            content: resultData.content,
            title: "Generar Presentación",
          });
        }
      }
      // Manejar texto normal
      else {
        await executeCommandMutation.mutateAsync({
          taskId,
          command,
        });
      }
    } catch (error) {
      console.error("Error executing command:", error);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 gap-8 sm:gap-12">
        {/* Header Section */}
        <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            ¿Qué puedo hacer por ti?
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
            Soy NEXUS, tu asistente inteligente. Cuéntame qué necesitas y lo haré realidad.
          </p>
        </div>

        {/* Input Component */}
        <div className="w-full">
          <ManusSuggestionsInput
            onSubmit={handleSubmitCommand}
            isLoading={isLoading}
            progress={progress}
          />
        </div>

        {/* Result Display */}
        {showResult && resultData && (
          <>
            {/* Text Results */}
            {resultData.type === "text" && (
              <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-white/60 mb-3">
                    Resultado:
                  </h3>
                  <div className="text-white/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                    {resultData.content}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {resultData.type === "search" && resultData.query && (
              <SearchResults
                results={resultData.content as SearchResult[]}
                query={resultData.query}
              />
            )}

            {/* Code Display */}
            {resultData.type === "code" && (
              <CodeDisplay
                code={resultData.content.code}
                language={resultData.content.language}
              />
            )}

            {/* Slides Generator */}
            {resultData.type === "slides" && (
              <SlidesGenerator
                topic={
                  resultData.title ||
                  "Presentación NEXUS"
                }
                content={resultData.content}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-white/40 text-xs sm:text-sm py-4">
        <p>Powered by NEXUS Agent</p>
      </div>
    </div>
  );
}
