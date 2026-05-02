import { SearchResult } from "@/lib/searchService";
import { ExternalLink } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-2">
            Resultados de búsqueda
          </h3>
          <p className="text-white/80 text-sm">
            Búsqueda: <span className="font-semibold text-blue-400">{query}</span>
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No se encontraron resultados</p>
            </div>
          ) : (
            results.map((result, index) => (
              <a
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {result.title}
                    </h4>
                    <p className="text-xs text-white/50 mt-1 truncate">
                      {result.source}
                    </p>
                    <p className="text-sm text-white/70 mt-2 line-clamp-2">
                      {result.snippet}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-white/40">
            Resultados proporcionados por DuckDuckGo
          </p>
        </div>
      </div>
    </div>
  );
}
