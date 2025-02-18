"use client";

import { useState, useRef, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import {
  ArrowLeft,
  Download,
  Redo2,
  Undo2,
  Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogoCanvas } from "@/components/logo-canvas";
import { LogoSidebar } from "@/components/logo-sidebar";
import { PresetSelector } from "@/components/preset-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconGrid } from "@/components/icon-grid";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const canvasRef = useRef<LogoCanvasRef>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

  const updateIconState = useCallback(
    (key: keyof LogoState["icon"], value: string | number) => {
      setLogoState((prevState) => ({
        ...prevState,
        icon: {
          ...prevState.icon,
          [key]: value,
        },
      }));
    },
    []
  );

  const allIcons = Object.keys(LucideIcons).slice(0, -2);
  const filteredIcons = searchQuery
    ? allIcons.filter((iconName) =>
        iconName
          .toLowerCase()
          .replace(/icon$/i, "")
          .includes(searchQuery.toLowerCase().replace(/\s+/g, ""))
      )
    : allIcons;

  const SelectedIcon = LucideIcons[
    logoState.icon.type as keyof typeof LucideIcons
  ] as React.ElementType;

  return (
    <div className="flex h-screen flex-col bg-[#f8f9ff]">
      <header className="flex h-14 items-center justify-between px-4 bg-gradient-to-r from-[#006494] via-[#2C8C99] to-[#003554] text-white">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go Back</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h1 className="text-lg font-medium">Untitled design - Logo</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <SelectedIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Icon</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
                  className="text-white hover:bg-white/10"
                >
                  <Undo2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRedo}
                  className="text-white hover:bg-white/10"
                >
                  <Redo2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>

            <PresetSelector setLogoState={setLogoState} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download Logo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Icon Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Pick an icon</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(false)}
                className="h-6 w-6 p-0"
              ></Button>
            </div>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search icons"
              className="pl-9"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <ScrollArea className="h-[400px] mt-4">
            <IconGrid
              icons={filteredIcons}
              selectedIcon={logoState.icon.type}
              onIconSelect={(iconName) => {
                updateIconState("type", iconName);
                setIsDialogOpen(false);
                setSearchQuery("");
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
