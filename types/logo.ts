export interface LogoState {
  icon: {
    type: string
    size: number
    rotation: number
    borderWidth: number
    borderColor: string
    opacity: number
    fillColor: string;
  }
  background: {
    startColor: string
    endColor: string
    shape: "square" | "circle"
    borderRadius: number
    text: string
    textColor: string
    fontSize: number
    textX: number
    textY: number
  }
}

export interface Preset {
  id: string
  name: string
  state: LogoState
  preview: string
}

