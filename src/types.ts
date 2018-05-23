
export type SpriteSheet = {
  debug: boolean,
  url: string,
  cols: number,
  rows: number,
  cutOffFrames: number,
  top: number | 'center',
  bottom: number,
  left: number | 'center',
  right: number,
  startSprite: number,
  onLoaded: () => void,
}

export type Frame = {
  sprite: number,
  delay: number,
  top: number,
  right: number,
  bottom: number,
  left: number
}

export type Animation = {
  play: boolean,
  delay: number,
  tempo: number,
  run: number,
  reversed: boolean,
  outOfViewStop: boolean,
  script: Frame[],
  lastTime: number,
  nextDelay: number,
  currentFrame: number,
  currentSprite: number,
  onPlay: () => void,
  onStop: () => void,
  onFrame: () => void
}

export type Internal = {
  loaded: boolean,
  totalSprites: number,
  sheetWidth: number,
  sheetHeight: number,
  frameWidth: number,
  frameHeight: number,
  animations: { [key: string]: Frame[] }
}
