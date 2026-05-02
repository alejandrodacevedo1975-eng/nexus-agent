/**
 * Servicio de búsqueda web usando DuckDuckGo API
 * No requiere API key y es completamente gratuito
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    // Usar DuckDuckGo API (sin autenticación requerida)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error en la búsqueda");
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Procesar resultados de DuckDuckGo
    if (data.Results && data.Results.length > 0) {
      data.Results.slice(0, 8).forEach((result: any) => {
        results.push({
          title: result.Title,
          url: result.FirstURL,
          snippet: result.Text,
          source: new URL(result.FirstURL).hostname,
        });
      });
    }

    // Si no hay resultados, intentar con AbstractText
    if (results.length === 0 && data.AbstractText) {
      results.push({
        title: data.AbstractTitle || "Resumen",
        url: data.AbstractURL || "#",
        snippet: data.AbstractText,
        source: "DuckDuckGo",
      });
    }

    return results;
  } catch (error) {
    console.error("Error en searchWeb:", error);
    // Retornar resultados de ejemplo si falla
    return [
      {
        title: "Error en la búsqueda",
        url: "#",
        snippet: "No se pudo conectar al servicio de búsqueda. Por favor, intenta de nuevo.",
        source: "Error",
      },
    ];
  }
}

/**
 * Detectar el lenguaje de programación del código
 */
export function detectLanguage(code: string): string {
  const languages: { [key: string]: string[] } = {
    javascript: ["function", "const", "let", "var", "=>", "require", "import"],
    python: ["def", "class", "import", "from", "if __name__"],
    java: ["public class", "public static", "import", "package"],
    cpp: ["#include", "std::", "int main", "cout"],
    csharp: ["using", "class", "public static", "namespace"],
    html: ["<!DOCTYPE", "<html", "<body", "<div"],
    css: ["@media", "selector", "{", "color:", "background"],
    sql: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE"],
    bash: ["#!/bin/bash", "echo", "export", "$"],
    typescript: ["interface", "type", "enum", "readonly", "as const"],
  };

  let detectedLanguage = "plaintext";
  let maxMatches = 0;

  for (const [lang, keywords] of Object.entries(languages)) {
    const matches = keywords.filter((kw) =>
      code.toLowerCase().includes(kw.toLowerCase())
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      detectedLanguage = lang;
    }
  }

  return detectedLanguage;
}
