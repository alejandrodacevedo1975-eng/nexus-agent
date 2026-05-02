import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface Task {
  id: string;
  command: string;
  status: "pending" | "running" | "completed" | "error";
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

interface TaskHistorySidebarProps {
  tasks: Task[];
  selectedTaskId?: string;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskHistorySidebar({
  tasks,
  selectedTaskId,
  onSelectTask,
  onDeleteTask,
}: TaskHistorySidebarProps) {
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "running":
        return <Clock size={16} className="text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-400">Completada</Badge>;
      case "running":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400">En progreso</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-500/10 text-red-400">Error</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted/50">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Historial de Tareas</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No hay tareas aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTaskId === task.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate text-foreground">
                    {task.command.substring(0, 40)}
                    {task.command.length > 40 ? "..." : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2">
                {getStatusBadge(task.status)}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>

              {task.error && (
                <p className="text-xs text-red-400 mt-2 truncate">{task.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
