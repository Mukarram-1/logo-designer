"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Download,
  Redo2,
  Undo2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoCanvas } from "@/components/logo-canvas";
import { LogoSidebar } from "@/components/logo-sidebar";
import { PresetSelector } from "@/components/preset-selector";
import type { LogoState } from "@/types/logo";

const initialLogoState: LogoState = {
  icon: {
    type: "ZapIcon",
    size: 406,
    rotation: 0,
    borderWidth: 2.3,
    borderColor: "#000000",
    opacity: 0,
    fillColor: "#ffffff",
  },
  background: {
    startColor: "#2C8C99",
    endColor: "#006494",
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
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#f8f9ff]">
      <header className="flex h-14 items-center justify-between px-4 bg-gradient-to-r from-[#006494] via-[#2C8C99] to-[#003554] text-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Untitled design - Logo</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            className="text-white hover:bg-white/10"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            className="text-white hover:bg-white/10"
          >
            <Redo2 className="h-5 w-5" />
          </Button>
          <PresetSelector setLogoState={setLogoState} />
          <Button
            onClick={handleDownload}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button className="bg-white text-[#0fa3b1] hover:bg-white/90">
            <Plus className="mr-2 h-4 w-4" />
            Upgrade your plan
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex">
          <LogoSidebar logoState={logoState} setLogoState={setLogoState} />
        </div>
        <div className="flex-1 overflow-auto p-8 bg-[#f1f3f9]">
          <div className="mx-auto max-w-[800px]">
            <LogoCanvas
              logoState={logoState}
              setLogoState={setLogoState}
              ref={canvasRef}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
