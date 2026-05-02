import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Zap, Monitor, Mic, Loader2 } from "lucide-react";
import { useState } from "react";

interface ManusSuggestionsInputProps {
  onSubmit: (command: string) => void;
  isLoading: boolean;
  progress?: number;
}

const SUGGESTIONS = [
  { label: "Analizar datos", icon: "📊" },
  { label: "Crear contenido", icon: "✍️" },
  { label: "Escribir código", icon: "💻" },
  { label: "Investigar", icon: "🔍" },
  { label: "Diseño", icon: "🎨" },
  { label: "Más", icon: "⭐" },
];

export default function ManusSuggestionsInput({
  onSubmit,
  isLoading,
  progress = 0,
}: ManusSuggestionsInputProps) {
  const [command, setCommand] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isLoading) {
      onSubmit(command);
      setCommand("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSubmit(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Input Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <div
          className={`relative rounded-2xl border transition-all duration-300 ${
            isFocused
              ? "border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10"
              : "border-white/10 bg-white/5 hover:bg-white/8"
          }`}
        >
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            placeholder="¿Qué puedo hacer por ti?"
            className="w-full bg-transparent border-0 text-lg placeholder:text-white/40 focus-visible:ring-0 resize-none min-h-16 p-6 text-white"
            rows={1}
          />

          {/* Icon Buttons at Bottom */}
          <div className="flex items-center justify-between px-6 pb-4 pt-2 border-t border-white/5">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white"
                title="Agregar"
              >
                <Plus size={20} />
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white"
                title="Herramientas"
              >
                <Zap size={20} />
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white"
                title="Pantalla"
              >
                <Monitor size={20} />
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white"
                title="Micrófono"
              >
                <Mic size={20} />
              </button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || !command.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Procesando...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </form>

      {/* Suggestions Grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion.label)}
            disabled={isLoading}
            className="group relative px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center justify-center gap-2">
              <span className="text-lg">{suggestion.icon}</span>
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                {suggestion.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
