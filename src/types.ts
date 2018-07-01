
export interface SpriteSheetOptions {
  url?: string
  cols: number
  rows: number
  cutOffFrames?: number
  top?: number | 'center'
  bottom?: number
  left?: number | 'center'
  right?: number
  startSprite?: number
  downsizeRatio?: number
  onLoaded?: () => void
}

export interface SpriteSheet extends SpriteSheetOptions {
  loaded: boolean
  totalSprites: number
  sheetWidth: number
  sheetHeight: number
  frameWidth: number
  frameHeight: number
  animations: { [key: string]: Frame[] }
}

export interface Frame {
  sprite: number
  delay?: number
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface AnimationOptions {
  play?: boolean
  delay?: number
  tempo?: number
  run?: number
  reversed?: boolean
  script?: Frame[]
  onPlay?: () => void
  onStop?: () => void
  onFrame?: (frameNumber: number) => void
  onOutOfView?: () => void
}

export interface Animation extends AnimationOptions {
  script: Frame[]
  lastTime: number
  nextDelay: number
  currentFrame: number
  currentSprite: number
}
