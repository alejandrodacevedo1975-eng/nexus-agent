import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { generatePresentation, downloadFile } from "@/lib/slidesService";

interface SlidesGeneratorProps {
  topic: string;
  content: string;
}

export default function SlidesGenerator({ topic, content }: SlidesGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSlides = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generatePresentation(topic, content);
      const filename = `${topic.replace(/\s+/g, "_")}_${Date.now()}.pptx`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error("Error generating slides:", err);
      setError(
        "Error al generar las diapositivas. Asegúrate de que pptxgenjs esté instalado."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-2">
            Generar Presentación
          </h3>
          <p className="text-white/80 text-sm">
            Tema: <span className="font-semibold text-blue-400">{topic}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGenerateSlides}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar Presentación PowerPoint
              </>
            )}
          </button>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              ℹ️ Se generará una presentación en formato PPTX con el contenido
              proporcionado. Puedes editarla en PowerPoint, Google Slides o
              cualquier editor compatible.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-white/40">
            Generado con pptxgenjs
          </p>
        </div>
      </div>
    </div>
  );
}
