"use client";

import { useState, useMemo, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import React from "react";

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
import type { LogoState } from "@/types/logo";

interface LogoSidebarProps {
  logoState: LogoState;
  setLogoState: (state: LogoState) => void;
}

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
      <div ref={parentRef} className="h-40 overflow-auto border rounded-md">
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
                        "h-10 w-10",
                        selectedIcon === iconName && "bg-muted"
                      )}
                      onClick={() => onIconSelect(iconName)}
                    >
                      {LucideIcon && <LucideIcon className="h-6 w-6" />}
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
  const [selectedTab, setSelectedTab] = useState<"icon" | "background">("icon");
  const [searchQuery, setSearchQuery] = useState("");

  const allIcons = useMemo(() => Object.keys(LucideIcons).slice(0, -2), []);

  const filteredIcons = useMemo(
    () =>
      searchQuery
        ? allIcons.filter((iconName) =>
            iconName
              .toLowerCase()
              .includes(searchQuery.toLowerCase().replace(/\s+/g, ""))
          )
        : allIcons,
    [searchQuery, allIcons]
  );

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

  return (
    <div className="w-80 border-r bg-background overflow-auto">
      <div className="flex border-b">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none",
            selectedTab === "icon" && "bg-muted"
          )}
          onClick={() => setSelectedTab("icon")}
        >
          Icon
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none",
            selectedTab === "background" && "bg-muted"
          )}
          onClick={() => setSelectedTab("background")}
        >
          Background
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {selectedTab === "icon" ? (
          <>
            <div className="space-y-2">
              <Label>Search Icons</Label>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IconGrid
                icons={filteredIcons}
                selectedIcon={logoState.icon.type}
                onIconSelect={(iconName) => updateIconState("type", iconName)}
              />
            </div>

            <div className="space-y-2">
              <Label>Size ({logoState.icon.size}px)</Label>
              <Slider
                value={[logoState.icon.size]}
                min={16}
                max={512}
                step={1}
                onValueChange={([value]) => updateIconState("size", value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rotation ({logoState.icon.rotation}°)</Label>
              <Slider
                value={[logoState.icon.rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([value]) => updateIconState("rotation", value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Width ({logoState.icon.borderWidth}px)</Label>
              <Slider
                value={[logoState.icon.borderWidth]}
                min={0}
                max={20}
                step={0.1}
                onValueChange={([value]) =>
                  updateIconState("borderWidth", value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Border Color</Label>
              <Input
                type="color"
                value={logoState.icon.borderColor}
                onChange={(e) => updateIconState("borderColor", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fill Opacity ({logoState.icon.opacity}%)</Label>
              <Slider
                value={[logoState.icon.opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => updateIconState("opacity", value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fill Color</Label>
              <Input
                type="color"
                value={logoState.icon.fillColor}
                onChange={(e) => updateIconState("fillColor", e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Background Start Color</Label>
              <Input
                type="color"
                value={logoState.background.startColor}
                onChange={(e) =>
                  updateBackgroundState("startColor", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Background End Color</Label>
              <Input
                type="color"
                value={logoState.background.endColor}
                onChange={(e) =>
                  updateBackgroundState("endColor", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Shape</Label>
              <Select
                value={logoState.background.shape}
                onValueChange={(value) => updateBackgroundState("shape", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                value={logoState.background.text}
                onChange={(e) => updateBackgroundState("text", e.target.value)}
                placeholder="Enter logo text"
              />
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={logoState.background.textColor}
                onChange={(e) =>
                  updateBackgroundState("textColor", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Font Size ({logoState.background.fontSize}px)</Label>
              <Slider
                value={[logoState.background.fontSize]}
                min={12}
                max={72}
                step={1}
                onValueChange={([value]) =>
                  updateBackgroundState("fontSize", value)
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
