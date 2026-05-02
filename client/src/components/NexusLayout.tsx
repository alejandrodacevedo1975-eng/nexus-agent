import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface NexusLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  logs?: React.ReactNode;
}

export default function NexusLayout({ children, sidebar, logs }: NexusLayoutProps) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={`flex flex-col border-r border-border bg-card transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-accent">NEXUS-AGENT</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">{sidebar}</div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h2 className="text-lg font-semibold">NEXUS-AGENT Interface</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut size={20} />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          {/* Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-lg border border-border">
            {children}
          </div>

          {/* Logs Panel */}
          <div
            className={`flex flex-col border border-border bg-card rounded-lg transition-all duration-300 overflow-hidden ${
              logsOpen ? "w-80" : "w-0"
            }`}
          >
            <div className="flex items-center justify-between h-12 px-4 border-b border-border">
              <h3 className="font-semibold text-sm">Logs</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLogsOpen(!logsOpen)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 text-xs space-y-2 font-mono">{logs}</div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
