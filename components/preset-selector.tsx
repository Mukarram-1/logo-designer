"use client";

import { Button } from "@/components/ui/button";
import type { Preset } from "@/types/logo";
import { useState } from "react";
import type { LogoState } from "@/types/logo";
const presets: Preset[] = [
  {
    id: "1",
    name: "Sunset",
    preview: "/preset1.png",
    state: {
      icon: {
        type: "HeartIcon",
        size: 406,
        rotation: 0,
        borderWidth: 2.3,
        borderColor: "#ffffff",
        opacity: 0,
        fillColor: "#ffffff",
      },
      background: {
        startColor: "#ff7676",
        endColor: "#f54ea2",
        shape: "square",
        borderRadius: 32,
        text: "Preset 1",
        textColor: "#ffffff",
        fontSize: 24,
        textX: 256,
        textY: 256,
      },
    },
  },
  {
    id: "2",
    name: "Ocean",
    preview: "/preset2.png",
    state: {
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
        startColor: "#4facfe",
        endColor: "#00f2fe",
        shape: "square",
        borderRadius: 32,
        text: "Preset 2",
        textColor: "#ffffff",
        fontSize: 24,
        textX: 256,
        textY: 256,
      },
    },
  },
  {
    id: "3",
    name: "Forest",
    preview: "/preset3.png",
    state: {
      icon: {
        type: "HeartIcon",
        size: 406,
        rotation: 0,
        borderWidth: 2.3,
        borderColor: "#ffffff",
        opacity: 0,
        fillColor: "#ffffff",
      },
      background: {
        startColor: "#43e97b",
        endColor: "#38f9d7",
        shape: "square",
        borderRadius: 32,
        text: "Preset 3",
        textColor: "#ffffff",
        fontSize: 24,
        textX: 256,
        textY: 256,
      },
    },
  },
];

interface PresetSelectorProps {
  setLogoState: React.Dispatch<React.SetStateAction<LogoState>>;
}
export function PresetSelector({ setLogoState }: PresetSelectorProps) {
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
    const handlePresetChange = (index: number) => {
      setCurrentPresetIndex(index);
      setLogoState(presets[index].state);
    };
  return (
    <div className="flex gap-2">
      {presets.map((preset, index) => (
        <Button
          key={preset.id}
          variant="outline"
          size="icon"
          className={`h-8 w-8 rounded-full ${
            currentPresetIndex === index ? "ring-2 ring-primary" : ""
          }`}
          style={{
            background: `linear-gradient(135deg, ${preset.state.background.startColor}, ${preset.state.background.endColor})`,
          }}
          onClick={() => handlePresetChange(index)}
        >
          <span className="sr-only">{preset.name}</span>
        </Button>
      ))}
    </div>
  );
}
