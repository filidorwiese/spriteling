class Spriteling {
  spriteDefaults = {
    debug: false,
    url: null,
    cols: null,
    rows: null,
    cutOffFrames: 0,
    top: null,
    bottom: null,
    left: null,
    right: null,
    startSprite: 1,
    onLoaded: null
  }

  animationDefaults = {
    play: true,
    delay: 50,
    tempo: 1,
    run: 1,
    reversed: false,
    outOfViewStop: false,
    script: [],
    lastTime: 0,
    nextDelay: 0,
    currentFrame: -1,
    currentSprite: 1,
    onPlay: null,
    onStop: null,
    onFrame: null
  }

  _internal = {
    loaded: false,
    totalSprites: 0,
    sheetWidth: 0,
    sheetHeight: 0,
    frameWidth: 0,
    frameHeight: 0,
    animations: {}
  }

  _globals = {}

  _playhead = {}

  _element = false

  constructor (element, options) {
    this._globals = Object.assign({}, this.spriteDefaults, options);

    console.log(this._globals)
  }

  showSprite() {}
  currentSprite() {}

  addScript() {}
  setTempo() {}

  current() {}
  next() {}
  previous() {}
  goTo() {}
  play() {}
  reverse() {}
  stop() {}
  reset() {}
}

export default Spriteling