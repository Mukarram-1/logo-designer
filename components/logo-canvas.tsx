"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import type { LogoState } from "@/types/logo";
import type React from "react";

interface LogoCanvasProps {
  logoState: LogoState;
  setLogoState: React.Dispatch<React.SetStateAction<LogoState>>;
}
type LogoCanvasRef = {
  canvas: HTMLCanvasElement | null;
  undo: () => void;
  redo: () => void;
};
export const LogoCanvas = forwardRef<LogoCanvasRef, LogoCanvasProps>(
  ({ logoState, setLogoState }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const iconImageRef = useRef<{
      fill: HTMLImageElement | null;
      stroke: HTMLImageElement | null;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameId = useRef<number>(0);
    const [stateHistory, setStateHistory] = useState<LogoState[]>([logoState]);
    const [currentStateIndex, setCurrentStateIndex] = useState(0);
    const initialRender = useRef(true);

      useImperativeHandle(
      ref,
      () => ({
        canvas: canvasRef.current,
        undo: () => {
          if (currentStateIndex > 0) {
            const newIndex = currentStateIndex - 1;
            setCurrentStateIndex(newIndex);
            setLogoState(stateHistory[newIndex]);
          }
        },
        redo: () => {
          if (currentStateIndex < stateHistory.length - 1) {
            const newIndex = currentStateIndex + 1;
            setCurrentStateIndex(newIndex);
            setLogoState(stateHistory[newIndex]);
          }
        },
      }),
      [currentStateIndex, stateHistory, setLogoState]
    );

    // Track state changes
    useEffect(() => {
      if (initialRender.current) {
        initialRender.current = false;
        return;
      }

      const currentState = stateHistory[currentStateIndex];
      if (JSON.stringify(logoState) !== JSON.stringify(currentState)) {
        const newHistory = [
          ...stateHistory.slice(0, currentStateIndex + 1),
          logoState,
        ];
        setStateHistory(newHistory);
        setCurrentStateIndex(newHistory.length - 1);
      }
    }, [logoState, stateHistory, currentStateIndex]);

    const drawLogo = useCallback(
      (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.save();
        if (logoState.background.shape === "circle") {
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2,
            0,
            Math.PI * 2
          );
          ctx.clip();
        } else {
          ctx.beginPath();
          ctx.roundRect(
            0,
            0,
            canvas.width,
            canvas.height,
            logoState.background.borderRadius
          );
          ctx.clip();
        }

        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );
        gradient.addColorStop(0, logoState.background.startColor);
        gradient.addColorStop(1, logoState.background.endColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw icon
        if (
          iconImageRef.current &&
          iconImageRef.current.fill &&
          iconImageRef.current.stroke
        ) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((logoState.icon.rotation * Math.PI) / 180);
          const scale = logoState.icon.size / 24;
          ctx.scale(scale, scale);
          ctx.translate(-12, -12);

          // Draw the filled icon
          ctx.globalAlpha = logoState.icon.opacity / 100;
          ctx.drawImage(iconImageRef.current.fill, 0, 0);

          // Draw the stroked icon
          ctx.globalAlpha = 1;
          ctx.drawImage(iconImageRef.current.stroke, 0, 0);

          ctx.restore();
        }

        // Draw text
        if (logoState.background.text) {
          ctx.save();
          ctx.font = `${logoState.background.fontSize}px Arial`;
          ctx.fillStyle = logoState.background.textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            logoState.background.text,
            logoState.background.textX,
            logoState.background.textY
          );
          ctx.restore();
        }
      },
      [logoState]
    );

    // Handle icon loading
    useEffect(() => {
      const loadIcon = async () => {
        const icons = await import("lucide-react");
        const IconComponent = icons[
          logoState.icon.type as keyof typeof icons
        ] as React.ComponentType<{
          color?: string;
          size?: number;
          strokeWidth?: number;
          fill?: string;
        }>;

        if (!IconComponent) {
          iconImageRef.current = null;
          return;
        }

        const iconSvg = document.createElement("div");
        iconSvg.style.position = "absolute";
        iconSvg.style.top = "-9999px";
        document.body.appendChild(iconSvg);

        const ReactDOMServer = await import("react-dom/server");

        // Fill version
        iconSvg.innerHTML = ReactDOMServer.renderToString(
          <IconComponent
            color={logoState.icon.fillColor}
            size={24}
            strokeWidth={0}
            fill={logoState.icon.fillColor}
          />
        );

        const fillSvgElement = iconSvg.querySelector("svg");
        if (fillSvgElement) {
          const fillSvgString = new XMLSerializer().serializeToString(
            fillSvgElement
          );
          const fillImg = new Image();
          fillImg.onload = () => {
            iconImageRef.current = { fill: fillImg, stroke: null };
            loadStrokeIcon();
          };
          fillImg.src = "data:image/svg+xml;base64," + btoa(fillSvgString);
        }

        function loadStrokeIcon() {
          // Stroke version
          iconSvg.innerHTML = ReactDOMServer.renderToString(
            <IconComponent
              color={logoState.icon.borderColor}
              size={24}
              strokeWidth={1}
              fill="none"
            />
          );

          const strokeSvgElement = iconSvg.querySelector("svg");
          if (strokeSvgElement) {
            const strokeSvgString = new XMLSerializer().serializeToString(
              strokeSvgElement
            );
            const strokeImg = new Image();
            strokeImg.onload = () => {
              iconImageRef.current = {
                fill: iconImageRef.current?.fill || null,
                stroke: strokeImg,
              };
              // Trigger a redraw after both icons load
              const canvas = canvasRef.current;
              if (!canvas) return;
              drawLogo(canvas.getContext("2d")!, canvas);
            };
            strokeImg.src =
              "data:image/svg+xml;base64," + btoa(strokeSvgString);
          }
        }

        document.body.removeChild(iconSvg);
      };

      loadIcon();
    }, [
      logoState.icon.type,
      logoState.icon.borderColor,
      logoState.icon.fillColor,
    ]);

    // Handle canvas interactions
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.font = `${logoState.background.fontSize}px Arial`;
        const textWidth = ctx.measureText(logoState.background.text).width;
        const textHeight = logoState.background.fontSize;

        const halfWidth = textWidth / 2;
        const halfHeight = textHeight / 2;

        if (
          x >= logoState.background.textX - halfWidth &&
          x <= logoState.background.textX + halfWidth &&
          y >= logoState.background.textY - halfHeight &&
          y <= logoState.background.textY + halfHeight
        ) {
          setIsDragging(true);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setLogoState((prevState) => ({
            ...prevState,
            background: {
              ...prevState.background,
              textX: x,
              textY: y,
            },
          }));
        }
      };

      const handleMouseUp = () => {
        if (isDragging) {
          setIsDragging(false);
        }
      };

      // Animation loop
      const animate = () => {
        drawLogo(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(animate);
      };

      animationFrameId.current = requestAnimationFrame(animate);

      // Event listeners
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
      };
    }, [logoState, isDragging, setLogoState, drawLogo]);

    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="bg-transparent cursor-move"
        />
      </div>
    );
  }
);

LogoCanvas.displayName = "LogoCanvas";
