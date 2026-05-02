import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error" | "debug";
  message: string;
  details?: string;
}

interface LogsPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogsPanel({ logs, onClear }: LogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "debug":
        return "text-blue-400";
      default:
        return "text-foreground";
    }
  };

  const getLevelPrefix = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      case "debug":
        return "◆";
      default:
        return "•";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm">Logs en Tiempo Real</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 text-xs font-mono"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No hay logs aún</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group hover:bg-muted/30 p-1 rounded">
              <div className={`${getLevelColor(log.level)}`}>
                <span className="text-muted-foreground">
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                <span className="ml-2">{getLevelPrefix(log.level)}</span>
                <span className="ml-1">{log.message}</span>
              </div>
              {log.details && (
                <div className="text-muted-foreground ml-4 mt-1 opacity-75">
                  {log.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
