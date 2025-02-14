import { Undo2, Redo2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const presets = [
  { id: "1", backgroundColor: "bg-black" },
  { id: "2", backgroundColor: "bg-yellow-400" },
  { id: "3", backgroundColor: "bg-pink-400" },
  { id: "4", backgroundColor: "bg-green-400" },
  { id: "5", backgroundColor: "bg-red-400" },
];

interface LogoNavbarProps {
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function LogoNavbar({ onDownload, onUndo, onRedo }: LogoNavbarProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
      <Button variant="ghost" size="icon" onClick={onUndo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo}>
        <Redo2 className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Presets</span>
        <div className="flex gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="icon"
              className={`h-8 w-8 rounded-full ${preset.backgroundColor}`}
            />
          ))}
        </div>
      </div>
      <div className="ml-auto">
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Logo
        </Button>
      </div>
    </header>
  );
}
