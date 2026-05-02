import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";

interface CommandInputProps {
  onSubmit: (command: string) => void;
  isLoading: boolean;
  progress?: number;
}

export default function CommandInput({
  onSubmit,
  isLoading,
  progress = 0,
}: CommandInputProps) {
  const [command, setCommand] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isLoading) {
      onSubmit(command);
      setCommand("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Escribe una orden en lenguaje natural..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          disabled={isLoading || !command.trim()}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Procesando...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </form>
  );
}
