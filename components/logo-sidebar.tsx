"use client";

import React, { useState, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import {
  Type,
  Search,
  ChevronRight,
  Star,
  Image,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogoState } from "@/types/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LogoSidebarProps {
  logoState: LogoState;
  setLogoState: (state: LogoState) => void;
}

const menuItems = [
  { id: "icon", icon: Star, label: "Icon", color: "#FF6B6B" },
  { id: "background", icon: Image, label: "Background", color: "#4ECDC4" },
  { id: "text", icon: Type, label: "Text", color: "#FFD166" },
];

const elementCategories = ["Circle", "Logo", "Line", "Heart", "Star"];

const IconGrid = React.memo(
  ({
    icons,
    selectedIcon,
    onIconSelect,
  }: {
    icons: string[];
    selectedIcon: string;
    onIconSelect: (icon: string) => void;
  }) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: Math.ceil(icons.length / 4),
      getScrollElement: () => parentRef.current,
      estimateSize: () => 40,
      overscan: 5,
    });

    return (
      <div
        ref={parentRef}
        className="h-40 overflow-auto border rounded-md bg-white dark:bg-gray-800 shadow-inner"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowStart = virtualRow.index * 4;
            const rowIcons = icons.slice(rowStart, rowStart + 4);

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-4 gap-2 p-2"
              >
                {rowIcons.map((iconName) => {
                  const LucideIcon = LucideIcons[
                    iconName as keyof typeof LucideIcons
                  ] as React.ElementType;
                  return (
                    <Button
                      key={iconName}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-lg transition-all duration-200",
                        selectedIcon === iconName
                          ? "text-white shadow-lg bg-[#2C8C99]"
                          : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                      )}
                      onClick={() => onIconSelect(iconName)}
                    >
                      {LucideIcon && <LucideIcon className="h-10 w-10" />}
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

IconGrid.displayName = "IconGrid";

export function LogoSidebar({ logoState, setLogoState }: LogoSidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState("");

  // const allIcons = useMemo(() => Object.keys(LucideIcons).slice(0, -2), []);

  // const filteredIcons = useMemo(
  //   () =>
  //     searchQuery
  //       ? allIcons.filter((iconName) =>
  //           iconName
  //             .toLowerCase()
  //             .includes(searchQuery.toLowerCase().replace(/\s+/g, ""))
  //         )
  //       : allIcons,
  //   [searchQuery, allIcons]
  // );

  const updateIconState = useCallback(
    (key: keyof LogoState["icon"], value: string | number) => {
      setLogoState({
        ...logoState,
        icon: {
          ...logoState.icon,
          [key]: value,
        },
      });
    },
    [logoState, setLogoState]
  );

  const updateBackgroundState = useCallback(
    (key: keyof LogoState["background"], value: string | number) => {
      setLogoState({
        ...logoState,
        background: {
          ...logoState.background,
          [key]: value,
        },
      });
    },
    [logoState, setLogoState]
  );

  const renderIconContent = () => (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          {/* <Label className="text-sm font-medium text-gray-600">
            Search Icons
          </Label> */}
          {/* <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          /> */}
          {/* <IconGrid
            icons={filteredIcons}
            selectedIcon={logoState.icon.type}
            onIconSelect={(iconName) => updateIconState("type", iconName)}
          /> */}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Size ({logoState.icon.size}px)
          </Label>
          <Slider
            value={[logoState.icon.size]}
            min={16}
            max={512}
            step={1}
            onValueChange={([value]) => updateIconState("size", value)}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Rotation ({logoState.icon.rotation}°)
          </Label>
          <Slider
            value={[logoState.icon.rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={([value]) => updateIconState("rotation", value)}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Border Width ({logoState.icon.borderWidth}px)
          </Label>
          <Slider
            value={[logoState.icon.borderWidth]}
            min={0}
            max={20}
            step={0.1}
            onValueChange={([value]) => updateIconState("borderWidth", value)}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Border Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={logoState.icon.borderColor}
              onChange={(e) => updateIconState("borderColor", e.target.value)}
              className="w-12 h-12 p-1 rounded-md"
            />
            <Input
              type="text"
              value={logoState.icon.borderColor}
              onChange={(e) => updateIconState("borderColor", e.target.value)}
              className="flex-grow bg-gray-50 border border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Fill Opacity ({logoState.icon.opacity}%)
          </Label>
          <Slider
            value={[logoState.icon.opacity]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => updateIconState("opacity", value)}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Fill Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={logoState.icon.fillColor}
              onChange={(e) => updateIconState("fillColor", e.target.value)}
              className="w-12 h-12 p-1 rounded-md"
            />
            <Input
              type="text"
              value={logoState.icon.fillColor}
              onChange={(e) => updateIconState("fillColor", e.target.value)}
              className="flex-grow bg-gray-50 border border-gray-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBackgroundContent = () => (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Background Start Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={logoState.background.startColor}
              onChange={(e) =>
                updateBackgroundState("startColor", e.target.value)
              }
              className="w-12 h-12 p-1 rounded-md"
            />
            <Input
              type="text"
              value={logoState.background.startColor}
              onChange={(e) =>
                updateBackgroundState("startColor", e.target.value)
              }
              className="flex-grow bg-gray-50 border border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Background End Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={logoState.background.endColor}
              onChange={(e) =>
                updateBackgroundState("endColor", e.target.value)
              }
              className="w-12 h-12 p-1 rounded-md"
            />
            <Input
              type="text"
              value={logoState.background.endColor}
              onChange={(e) =>
                updateBackgroundState("endColor", e.target.value)
              }
              className="flex-grow bg-gray-50 border border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Shape</Label>
          <Select
            value={logoState.background.shape}
            onValueChange={(value) => updateBackgroundState("shape", value)}
          >
            <SelectTrigger className="bg-gray-50 border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Border Radius ({logoState.background.borderRadius}px)
          </Label>
          <Slider
            value={[logoState.background.borderRadius]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) =>
              updateBackgroundState("borderRadius", value)
            }
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderTextContent = () => (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Text</Label>
          <Input
            value={logoState.background.text}
            onChange={(e) => updateBackgroundState("text", e.target.value)}
            placeholder="Enter logo text"
            className="bg-gray-50 border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={logoState.background.textColor}
              onChange={(e) =>
                updateBackgroundState("textColor", e.target.value)
              }
              className="w-12 h-12 p-1 rounded-md"
            />
            <Input
              type="text"
              value={logoState.background.textColor}
              onChange={(e) =>
                updateBackgroundState("textColor", e.target.value)
              }
              className="flex-grow bg-gray-50 border border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Font Size ({logoState.background.fontSize}px)
          </Label>
          <Slider
            value={[logoState.background.fontSize]}
            min={12}
            max={72}
            step={1}
            onValueChange={([value]) =>
              updateBackgroundState("fontSize", value)
            }
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Main Sidebar */}
      <div className="w-[85px] border-r bg-white">
        <div className="flex flex-col items-center gap-1 py-2">
          <TooltipProvider>
            {menuItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative h-16 w-16 rounded-xl p-2",
                      activeMenu === item.id ? "bg-gray-100" : ""
                    )}
                    onClick={() =>
                      setActiveMenu(activeMenu === item.id ? null : item.id)
                    }
                  >
                    <item.icon 
                      className="h-[10px] w-[10px]" 
                      style={{ color: item.color }}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Elements Panel */}
      {activeMenu === "elements" && (
        <div className="w-[280px] border-r bg-white">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search elements" className="pl-9" />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="px-4">
              <div className="flex gap-2 overflow-x-auto pb-4">
                {elementCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="rounded-full whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <section>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-square bg-black" />
                    <div className="aspect-square bg-black rounded-lg" />
                    <div className="h-[40px] bg-black" />
                    <div className="h-[40px] bg-black rotate-45" />
                  </div>
                </section>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Icon/Background/Text Editor Panel */}
      {(activeMenu === "icon" ||
        activeMenu === "background" ||
        activeMenu === "text") && (
        <div className="w-[280px] border-r bg-white">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              {activeMenu === "icon" && renderIconContent()}
              {activeMenu === "background" && renderBackgroundContent()}
              {activeMenu === "text" && renderTextContent()}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
