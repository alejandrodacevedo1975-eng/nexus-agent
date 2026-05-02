import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeDisplayProps {
  code: string;
  language: string;
}

export default function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
    }
  };

  // Función para aplicar colores básicos de syntax highlighting
  const highlightCode = (code: string, lang: string): string => {
    let highlighted = code;

    // Colores por tipo de token
    const patterns: { [key: string]: { pattern: RegExp; color: string }[] } = {
      javascript: [
        { pattern: /\b(function|const|let|var|return|if|else|for|while)\b/g, color: "#ff7b9c" }, // Keywords - rosa
        { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: "#a8e6cf" }, // Strings - verde
        { pattern: /\/\/.*$/gm, color: "#888" }, // Comments - gris
        { pattern: /\b\d+\b/g, color: "#ffd93d" }, // Numbers - amarillo
      ],
      python: [
        { pattern: /\b(def|class|return|if|else|for|while|import|from)\b/g, color: "#ff7b9c" },
        { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: "#a8e6cf" },
        { pattern: /#.*$/gm, color: "#888" },
        { pattern: /\b\d+\b/g, color: "#ffd93d" },
      ],
      html: [
        { pattern: /&lt;[^&]*&gt;/g, color: "#ff7b9c" }, // Tags
        { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: "#a8e6cf" },
      ],
      css: [
        { pattern: /\b(color|background|margin|padding|font|width|height)\b/g, color: "#ff7b9c" },
        { pattern: /([#.][\w-]+)/g, color: "#a8e6cf" },
        { pattern: /(['"`])(?:(?=(\\?))\2.)*?\1/g, color: "#ffd93d" },
      ],
    };

    return highlighted;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-white/70 uppercase">
              {language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Copiar código"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="p-6 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="font-mono text-sm leading-relaxed">
            <code className="text-white/90">
              {code.split("\n").map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="inline-block w-8 text-right pr-4 text-white/30 select-none">
                    {idx + 1}
                  </span>
                  <span className="flex-1">
                    {/* Syntax highlighting simple */}
                    {line.split(/(\b\w+\b|['"`]|\/\/|#)/g).map((token, i) => {
                      if (!token) return null;

                      // Keywords
                      if (
                        [
                          "function",
                          "const",
                          "let",
                          "var",
                          "return",
                          "if",
                          "else",
                          "for",
                          "while",
                          "def",
                          "class",
                          "import",
                          "from",
                          "true",
                          "false",
                          "null",
                          "undefined",
                        ].includes(token)
                      ) {
                        return (
                          <span key={i} style={{ color: "#ff7b9c" }}>
                            {token}
                          </span>
                        );
                      }

                      // Strings
                      if (['"', "'", "`"].includes(token[0])) {
                        return (
                          <span key={i} style={{ color: "#a8e6cf" }}>
                            {token}
                          </span>
                        );
                      }

                      // Comments
                      if (token === "//" || token === "#") {
                        const commentStart = line.indexOf(token);
                        return (
                          <span key={i} style={{ color: "#888" }}>
                            {line.substring(commentStart)}
                          </span>
                        );
                      }

                      // Numbers
                      if (/^\d+$/.test(token)) {
                        return (
                          <span key={i} style={{ color: "#ffd93d" }}>
                            {token}
                          </span>
                        );
                      }

                      return <span key={i}>{token}</span>;
                    })}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/3">
          <p className="text-xs text-white/40">
            {code.split("\n").length} líneas de código
          </p>
        </div>
      </div>
    </div>
  );
}
