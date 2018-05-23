import imageLoaded from 'image-loaded'
import raf from 'raf'

type SpriteSheet = {
    debug: boolean,
    url: string,
    cols: number,
    rows: number,
    cutOffFrames: number,
    top: number,
    bottom: number,
    left: number,
    right: number,
    startSprite: number,
    onLoaded: () => void
}

type Animation = {
    play: boolean,
    delay: number,
    tempo: number,
    run: number,
    reversed: boolean,
    outOfViewStop: boolean,
    script: Array<{ script: number}>,
    lastTime: number,
    nextDelay: number,
    currentFrame: number,
    currentSprite: number,
    onPlay: () => void,
    onStop: () => void,
    onFrame: () => void
}

class Spriteling {
  spriteSheetDefaults: SpriteSheet = {
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

  animationDefaults: Animation = {
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

  _spriteSheet = {}

  _playhead = {}

  _element = false

  /**
   * @options: object to override global options with, the following properties can be set
   *           - debug: show debug logging in console (default: false)
   *           - url: url to spriteSheet, if not set the css background-image will be used
   *           - cols: number columns in the spritesheet (mandatory)
   *           - rows: number rows in the spritesheet (mandatory)
   *           - cutOffFrames: number of sprites not used in the spritesheet (default: 0)
   *           - top/bottom/left/right: starting offset position
   *           - startSprite: number of the first sprite to show when done loading
   *           - onLoaded: callback that will be called when loading has finished
   * @element: can be a css selector or DOM element or false (in which case a new div element will be created)
   */

  constructor (options, element: boolean | undefined = false) {
    // Lookup element by selector
    if (element) {
      this._element = element instanceof Element ? element : document.querySelector(element)
      if (!this._element || !this._element instanceof Element) {
        this._log('warn', `element "${element}" not found, created new element instead`)
      }
    }

    // No element found, let's create one instead
    if (!this._element) {
      this._element = document.createElement('div')
      document.body.appendChild(this._element)
    }

    // Combine options with defaults
    this._spriteSheet = Object.assign({}, this.spriteSheetDefaults, options)

    // Initialize spritesheet
    if (!options.cols) { this._log('error', 'options.cols not set') }
    if (!options.rows) { this._log('error', 'options.rows not set') }
    if (!options.url) {
      // If no sprite is specified try to use background-image
      const elementStyle = window.getComputedStyle(this._element)
      const cssBackgroundImage = elementStyle.getPropertyValue('background-image')
      if (cssBackgroundImage === 'none') {
        this._log('error', 'no spritesheet image found, please specify it with options.url or set with css as background')
      } else {
        this._spriteSheet.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '')
      }
    }

    this._loadSpriteSheet()
  }

  /**
   * Show certain sprite (circumvents the current animation sequence)
   */
  showSprite = (spriteNumber: number) => {
    this._playhead.play = false
    this._drawFrame({sprite: spriteNumber})
  }

  /**
   * Get the current spriteNumber that is shown
   */
  currentSprite = () => {
    return this._playhead.currentSprite
  }

  /**
   * Add a named animation sequence
   * @name: string
   * @script: array with objects as frames, eg [{sprite: 1, delay: 200}, {sprite: 3, top:1 }]
   *          each frame can have the following properties
   *          - sprite: which sprite to show (mandatory)
   *          - delay: alternate delay then the default delay
   *          - top/left/bottom/right: reposition the placeholder
   */
  addScript = (name, script) => {
    this._internal.animations[name] = script
  }

  setTempo = (tempo) => {
    this._playhead.tempo = tempo
  }

  /**
   * Get the current frame
   */
  current = () => {
    return this._playhead.currentFrame
  }

  /**
   * Go forward one frame
   */
  next = () => {
    if (!this._internal.loaded) { return false }

    // Update counter
    this._playhead.currentFrame += 1
    if (this._playhead.currentFrame > (this._playhead.script.length - 1)) {
      this._playhead.currentFrame = 0
    }
    if (this._playhead.currentFrame === this._playhead.script.length - 1) {
      this._playhead.run -= 1
    }

    const frame = this._playhead.script[this._playhead.currentFrame]
    this._drawFrame(frame)
  }

  /**
   * Go back one frame
   */
  previous = () => {
    if (!this._internal.loaded) { return false }

    // Update counter
    this._playhead.currentFrame -= 1
    if (this._playhead.currentFrame < 0) {
      this._playhead.currentFrame = (this._playhead.script.length - 1)
    }
    if (this._playhead.currentFrame === 0) {
      this._playhead.run -= 1
    }

    const frame = this._playhead.script[this._playhead.currentFrame]
    this._drawFrame(frame)
  }

  /**
   * Jump to certain frame within current animation sequence
   * @param frameNumber [integer]
   * @returns {boolean}
   */
  goTo = (frameNumber) => {
    if (!this._internal.loaded) { return false }

    // Make sure given framenumber is within the animation
    const _baseNumber = Math.floor(frameNumber / this._playhead.script.length)
    frameNumber = Math.floor(frameNumber - (_baseNumber * this._playhead.script.length))

    // Draw frame
    this._playhead.currentFrame = frameNumber
    const frame = this._playhead.script[this._playhead.currentFrame]
    if (frame !== undefined) {
      this._log('info', 'frame: ' + this._playhead.currentFrame + ', sprite: ' + frame.sprite)
      this._drawFrame(frame)
    }
  }

  /**
   * Define a new animation sequence or resume if not playing
   * @animationObject:
   *          if object with animation settings, the following are allowed
   *              - play: start playing the animation right away (default: true)
   *              - run: the number of times the animation should run, -1 is infinite (default: 1)
   *              - delay: default delay for all frames that don't have a delay set (default: 50)
   *              - tempo: timescale for all delays, double-speed = 2, half-speed = .5 (default:1)
   *              - reversed: direction of the animation head, true == backwards (default: false)
   *              - outOfViewStop: stop animation if placeholder is no longer in view (default: false)
   *              - script: new animation array or string (in which case animation sequence is looked up)
   *              - onPlay/onStop/onFrame: callbacks called at the appropriate times (default: null)
   *          if not set, we resume the current animation or start the 'all' built-in animation sequence
   */
  play = (scriptName, animationObject = {}) => {
    // Not yet loaded, wait...
    if (!this._internal.loaded) {
      setTimeout(() => { this.play(scriptName, animationObject) }, 50)
      return false
    }

    if (scriptName) {
      // Script provided
      if (typeof scriptName === 'string') {
        animationObject.script = scriptName
      }

      // No script provided
      if (typeof scriptName === 'object') {
        animationObject = scriptName
      }

      // Resolve animation script
      if (typeof animationObject === 'object') {
        const scriptName = animationObject.script
        if (typeof scriptName === 'string') {
          animationObject.script = this._internal.animations[scriptName]
        }
        if (typeof scriptName === 'undefined') {
          animationObject.script = this._internal.animations['all']
        }
        this._log('info', `playing animation "${scriptName}"`)
        this._playhead = Object.assign({}, this.animationDefaults, animationObject)
      }

    } else {
      // Play if not already playing
      if (!this._playhead.play) {
        if (this._playhead.run === 0) { this._playhead.run = 1 }
        this._playhead.play = true
        this._loop()
      }
    }

    // Enter the animation loop
    if (this._playhead.run !== 0) {
      this._loop()
    }

    // onPlay callback
    if (typeof this._playhead.onPlay === 'function') {
      this._.playhead.onPlay()
    }
  }

  /**
   * Reverse direction of play
   */
  reverse = () => {
    this._playhead.reversed = !this._playhead.reversed
  }

  /**
   * Stop the animation
   */
  stop = () => {
    this._playhead.play = false

    // onStop callback
    if (typeof this._playhead.onStop === 'function') {
      this._playhead.onStop();
    }
  }

  /**
   * Reset playhead to first frame
   */
  reset = () => {
    this.goTo(0)
  }

  /**
   * Load the spritesheet and position it correctly
   */
  _loadSpriteSheet = () => {
    const _preload = new Image()
    _preload.src = this._spriteSheet.url

    imageLoaded(_preload, () => {
      if (this._internal.loaded) { return } // <- Fix for some unexplained firefox bug that loads this twice.
      this._internal.loaded = true

      this._log('info', 'loaded: ' + this._spriteSheet.url + ', sprites ' + this._spriteSheet.cols + ' x ' + this._spriteSheet.rows)

      this._internal.sheetWidth = _preload.width
      this._internal.sheetHeight = _preload.height
      this._internal.frameWidth = parseInt(this._internal.sheetWidth / this._spriteSheet.cols, 10)
      this._internal.frameHeight = parseInt(this._internal.sheetHeight / this._spriteSheet.rows, 10)
      this._internal.totalSprites = (this._spriteSheet.cols * this._spriteSheet.rows) - this._spriteSheet.cutOffFrames

      if (this._internal.frameWidth % 1 !== 0) {
        this._log('error', 'frameWidth ' + this._internal.frameWidth + ' is not a whole number')
      }
      if (this._internal.frameHeight % 1 !== 0) {
        this._log('error', 'frameHeight ' + this._internal.frameHeight + ' is not a whole number')
      }

      this._element.style.position = 'absolute'
      this._element.style.width = `${this._internal.frameWidth}px`
      this._element.style.height = `${this._internal.frameHeight}px`
      this._element.style.backgroundImage = `url(${this._spriteSheet.url})`
      this._element.style.backgroundPosition = '0 0'

      if (this._spriteSheet.top !== null) {
        if (this._spriteSheet.top === 'center') {

          this._element.style.top = '50%'
          this._element.style.marginTop = `${this._internal.frameHeight / 2 * -1}px`
        } else {
          this._element.style.top = `${this._spriteSheet.top}px`
        }
      }
      if (this._spriteSheet.right !== null) {
        this._element.style.right = `${this._spriteSheet.right}px`
      }
      if (this._spriteSheet.bottom !== null) {
        this._element.style.bottom = `${this._spriteSheet.bottom}px`
      }
      if (this._spriteSheet.left !== null) {
        if (this._spriteSheet.left === 'center') {
          this._element.style.left = `${this._spriteSheet.left}px`
          this._element.style.marginLeft = `${this._internal.frameWidth / 2 * -1}px`
        } else {
          this._element.style.left = `${this._spriteSheet.left}px`
        }
      }

      // Auto script the first 'all' animation sequence and make it default
      this._autoScript()
      const animationObject = {script: this._internal.animations['all']}
      this.playhead = Object.assign({}, this.animationDefaults, animationObject)

      // Starting sprite?
      if (this._spriteSheet.startSprite > 1 && this._spriteSheet.startSprite <= this._internal.totalSprites) {
        this.showSprite(this._spriteSheet.startSprite)
      }

      // onLoaded callback
      if (typeof this._spriteSheet.onLoaded === 'function') {
        this._spriteSheet.onLoaded()
      }
    })
  }

  /**
   * Generate a linear script based on the spritesheet itself
   */
  _autoScript = () => {
    const script = []
    for (let i = 0; i < this._internal.totalSprites; i++) {
      script[i] = {sprite: (i + 1)}
    }
    this.addScript('all', script)
  }

  /**
   * The animation loop
   */
  _loop = (time) => {
    // Should be called as soon as possible
    const requestFrameId = raf(this._loop)

    // Wait until fully loaded
    if (this._element !== null && this._internal.loaded) {

      // Only play when not paused
      if (this._playhead.play) {

        // Throttle on nextDelay
        if ((time - this._playhead.lastTime) >= this._playhead.nextDelay) {

          // Render next frame only if element is visible and within viewport
          if (this._element.offsetParent !== null) { // && _inViewport(this._element)

            // Only play if run counter is still <> 0
            if (this._playhead.run === 0) {
              this.stop()
            } else {

              if (this._playhead.reversed) {
                this.previous()
              } else {
                this.next()
              }

              const frame = this._playhead.script[this._playhead.currentFrame]
              this._playhead.nextDelay = (frame.delay ? frame.delay : this._playhead.delay)
              this._playhead.nextDelay /= this._playhead.tempo
              this._playhead.lastTime = time

              this._log('info', 'frame: ' + this._playhead.currentFrame + ', sprite: ' + frame.sprite + ', delay: ' + this._playhead.nextDelay + ', run: ' + this._playhead.run)
            }

          } else {
            if (this._playhead.outOfViewStop) {
              this.stop()
            }
          }

        }

      } else {
        // Cancel animation loop if play = false
        raf.cancel(requestFrameId)
      }
    }
  }

  /**
   * Draw a single frame
   */
  _drawFrame = (frame) => {
    if (frame.sprite === this._playhead.currentSprite) { return false }
    this._playhead.currentSprite = frame.sprite

    const row = Math.ceil(frame.sprite / this._spriteSheet.cols)
    const col = frame.sprite - ((row - 1) * this._spriteSheet.cols)
    const bgX = ((col - 1) * this._internal.frameWidth) * -1
    const bgY = ((row - 1) * this._internal.frameHeight) * -1

    if (row > this._spriteSheet.rows || col > this._spriteSheet.cols) {
      this._log('error', `position ${frame.sprite} out of bound'`)
    }

    // Animate background
    this._element.style.backgroundPosition = `${bgX}px ${bgY}px`
    const rect = this._element.getBoundingClientRect()

    // Move if indicated
    if (frame.top) {
      this._element.style.top = `${rect.top + frame.top}px`
    }
    if (frame.right) {
      this._element.style.top = `${rect.right + frame.right}px`
    }
    if (frame.bottom) {
      this._element.style.top = `${rect.bottom + frame.bottom}px`
    }
    if (frame.left) {
      this._element.style.top = `${rect.left + frame.left}px`
    }

    // onFrame callback
    if (typeof this._playhead.onFrame === 'function') {
      this._playhead.onFrame()
    }
  }

  /**
   * Log utility method
   * @param level
   * @param message
   * @private
   */
  _log = (level, message) => {
    if (level === 'info' && !this._spriteSheet.debug) return
    console[level](`SpriteLing: ${message}`)
  }
}

export default Spriteling