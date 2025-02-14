"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Download, Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoCanvas } from "@/components/logo-canvas";
import { LogoSidebar } from "@/components/logo-sidebar";
import { PresetSelector } from "@/components/preset-selector";
import type { LogoState } from "@/types/logo";

const initialLogoState: LogoState = {
  icon: {
    type: "HeartIcon",
    size: 406,
    rotation: 0,
    borderWidth: 2.3,
    borderColor: "#000000",
    opacity: 0,
    fillColor: "#ffffff",
  },
  background: {
    startColor: "#ff7676",
    endColor: "#f54ea2",
    shape: "square",
    text: "",
    textColor: "#ffffff",
    borderRadius: 32,
    fontSize: 24,
    textX: 256,
    textY: 256,
  },
};
type LogoCanvasRef = {
  canvas: HTMLCanvasElement | null;
  undo: () => void;
  redo: () => void;
};

export default function LogoDesigner() {
  const [logoState, setLogoState] = useState<LogoState>(initialLogoState);
  const canvasRef = useRef<LogoCanvasRef>(null);

  const handleDownload = () => {
    if (!canvasRef.current?.canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `logo-${Date.now()}.png`;
      // Access the canvas element through the ref's canvas property
      link.href = canvasRef.current.canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading logo:", error);
    }
  };
    const handleUndo = () => {
      if (canvasRef.current) {
        canvasRef.current?.undo();
      }
    };

    const handleRedo = () => {
      if (canvasRef.current) {
        canvasRef.current?.redo();
      }
    };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Logo Designer</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <PresetSelector setLogoState={setLogoState} />
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <LogoSidebar logoState={logoState} setLogoState={setLogoState} />
        <div className="flex-1 overflow-auto p-6">
          <LogoCanvas
            logoState={logoState}
            setLogoState={setLogoState}
            ref={canvasRef}
          />
        </div>
      </main>
    </div>
  );
}
