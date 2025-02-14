import React from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconDisplayProps {
  icons: string[];
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
}

export default function IconDisplay({
  icons,
  selectedIcon,
  onIconSelect,
}: IconDisplayProps): JSX.Element {
  return (
    <div className="h-40 overflow-auto border rounded-md p-2 grid grid-cols-4 gap-2">
      {icons.map((iconName) => {
        const LucideIcon = LucideIcons[iconName];
        return (
          <Button
            key={iconName}
            variant="ghost"
            size="icon"
            className={cn("h-10 w-10", selectedIcon === iconName && "bg-muted")}
            onClick={() => onIconSelect(iconName)}
          >
            {LucideIcon ? <LucideIcon className="h-6 w-6" /> : null}
          </Button>
        );
      })}
    </div>
  );
};
