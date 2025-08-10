"use client";

import { useState, useRef, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import {
  ArrowLeft,
  Download,
  Redo2,
  Undo2,
  Search,
  Sparkles
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
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGeneratedIcons, setAiGeneratedIcons] = useState<Array<{
    iconName: string;
    logoText: string;
    textColor: string;
    fontSize: number;
    iconColor: string;
    iconSize: number;
    backgroundColor: string;
    borderRadius: number;
  }>>([]);
  const [selectedAiIconIndex, setSelectedAiIconIndex] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const getSelectedIcon = () => {
    const iconName = logoState.icon.type;
    if (typeof iconName === 'string' && LucideIcons[iconName as keyof typeof LucideIcons]) {
      const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType;
      return <Icon className="h-5 w-5" />;
    }
    return <Undo2 className="h-5 w-5" />;
  };

  const handleAiPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiPrompt(e.target.value);
  };

  const generateAiIcon = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setAiGeneratedIcons([]);
    
    try {
      // Generate 4 icons in parallel
      const icons = await Promise.all(Array(4).fill(0).map(async () => {
        const response = await fetch('/api/generate-icon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: aiPrompt }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate icon');
        }
        
        return await response.json();
      }));
      
      setAiGeneratedIcons(icons);
      setSelectedAiIconIndex(-1);
    } catch (error) {
      console.error('Error generating icons:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const useAiGeneratedIcon = () => {
    if (selectedAiIconIndex === -1 || !aiGeneratedIcons[selectedAiIconIndex]) {
      return;
    }
    
    const selectedIcon = aiGeneratedIcons[selectedAiIconIndex];
    
    // Update icon state
    updateIconState("type", selectedIcon.iconName);
    updateIconState("fillColor", selectedIcon.iconColor);
    updateIconState("size", selectedIcon.iconSize);
    updateIconState("opacity", selectedIcon.backgroundColor ? 0 : 100);

    let startColor = "#2C8C99";
    let endColor = "#006494";
    
    if (selectedIcon.backgroundColor) {
      startColor = selectedIcon.backgroundColor;
      endColor = selectedIcon.backgroundColor;
    } else {
      const colorSchemes = [
        { start: "#2C8C99", end: "#006494" }, // Blue theme
        { start: "#3d5a80", end: "#293241" }, // Deep blue theme
        { start: "#606c38", end: "#283618" }, // Green theme
        { start: "#bc6c25", end: "#dda15e" }, // Orange theme
        { start: "#9e0059", end: "#390099" }, // Purple theme
        { start: "#1a535c", end: "#4ecdc4" }, // Teal theme
        { start: "#ef476f", end: "#ffd166" }, // Pink to yellow theme
      ];
      
      const selectedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      startColor = selectedScheme.start;
      endColor = selectedScheme.end;
    }
    
    setLogoState(prevState => ({
      ...prevState,
      icon: {
        ...prevState.icon,
        type: selectedIcon.iconName,
        size: selectedIcon.iconSize,
        borderColor: selectedIcon.iconColor,
      },
      background: {
        ...prevState.background,
        startColor: startColor,
        endColor: endColor,
        text: selectedIcon.logoText,
        textColor: selectedIcon.textColor,
        fontSize: selectedIcon.fontSize,
        borderRadius: selectedIcon.borderRadius
      }
    }));
    
    setIsAiDialogOpen(false);
    setAiPrompt("");
  };

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
          <h1 className="text-sm font-medium text-white">Untitled design - Logo</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsAiDialogOpen(true)}
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Ask AI
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Icon Generator</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20"
                  onClick={() => setIsDialogOpen(true)}
                >
                  {getSelectedIcon()}
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

      {/* AI Icon Generation Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Generate Icon with AI</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAiDialogOpen(false)}
                className="h-6 w-6 p-0"
              ></Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Describe the icon you want, and our AI will select perfect matches from our library.</p>
            
            <div className="flex gap-2">
              <Input
                placeholder="Describe the icon you want (e.g., 'fire logo', 'shopping cart')"
                value={aiPrompt}
                onChange={handleAiPromptChange}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button 
                onClick={generateAiIcon} 
                disabled={!aiPrompt.trim() || isGenerating}
                className="bg-[#2C8C99] text-white hover:bg-[#006494]"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
            
            {isGenerating && (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2C8C99] border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-600">AI is generating logo options...</p>
              </div>
            )}
            
            {!isGenerating && aiGeneratedIcons.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {aiGeneratedIcons.map((icon, index) => {
                    const IconComponent = LucideIcons[icon.iconName as keyof typeof LucideIcons] as React.ElementType;
                    
                    return (
                      <div 
                        key={index}
                        className={`border rounded-md cursor-pointer hover:shadow-lg transition-shadow ${selectedAiIconIndex === index ? 'ring-2 ring-[#2C8C99]' : ''}`}
                        style={{
                          backgroundColor: icon.backgroundColor || (selectedAiIconIndex === index ? 'bg-gradient-to-br from-[#2C8C99] to-[#006494]' : ''),
                          borderRadius: `${icon.borderRadius}px`
                        }}
                        onClick={() => setSelectedAiIconIndex(index)}
                      >
                        <div className="flex flex-col items-center justify-center p-4 h-40">
                          {IconComponent ? (
                            <IconComponent
                              className="mb-2"
                              style={{
                                width: `${Math.min(icon.iconSize/3, 64)}px`,
                                height: `${Math.min(icon.iconSize/3, 64)}px`,
                              }}
                              color={icon.iconColor}
                              strokeWidth={2}
                            />
                          ) : (
                            <span className="text-white mb-2">Icon not found</span>
                          )}
                          
                          {icon.logoText && (
                            <p
                              className="font-bold text-center px-4 truncate w-full"
                              style={{
                                color: `${icon.textColor}`,
                                fontSize: `${Math.min(icon.fontSize, 24)}px`,
                              }}
                            >
                              {icon.logoText}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={generateAiIcon}
                    className="border-[#2C8C99] text-[#2C8C99] hover:bg-[#e6f0f2]"
                  >
                    Regenerate Options
                  </Button>
                  
                  <Button 
                    onClick={useAiGeneratedIcon}
                    disabled={selectedAiIconIndex === -1}
                    className="bg-[#2C8C99] text-white hover:bg-[#006494]"
                  >
                    Use Selected Icon
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Icon Selection Dialog */}
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