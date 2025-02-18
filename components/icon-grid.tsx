"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IconGridProps {
  icons: string[];
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

export const IconGrid = React.memo(
  ({ icons, selectedIcon, onIconSelect }: IconGridProps) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: Math.ceil(icons.length / 13),
      getScrollElement: () => parentRef.current,
      estimateSize: () => 40,
      overscan: 5,
    });

    return (
      <div
        ref={parentRef}
        className="h-full rounded-md bg-white dark:bg-gray-800 shadow-inner"
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
