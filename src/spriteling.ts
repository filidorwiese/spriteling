import imageLoaded from 'image-loaded'
import raf from 'raf'
import {Animation, AnimationOptions, Frame, SpriteSheet, SpriteSheetOptions} from './types'

const playheadDefaults: Animation = {
  play: true,
  delay: 50,
  tempo: 1,
  run: -1,
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

class Spriteling {
  private spriteSheet: SpriteSheet = {
    loaded: false,
    url: null,
    cols: null,
    rows: null,
    cutOffFrames: 0,
    top: null,
    bottom: null,
    left: null,
    right: null,
    startSprite: 1,
    totalSprites: 0,
    sheetWidth: 0,
    sheetHeight: 0,
    frameWidth: 0,
    frameHeight: 0,
    animations: {},
    onLoaded: null
  }

  private playhead: Animation

  private readonly element: HTMLElement

  private debug: boolean

  /**
   * Creates a new Spriteling instance. The options object can contain the following values
   * - url: url to spriteSheet, if not set the css background-image will be used
   * - cols: number columns in the spritesheet (mandatory)
   * - rows: number rows in the spritesheet (mandatory)
   * - cutOffFrames: number of sprites not used in the spritesheet (default: 0)
   * - top/bottom/left/right: starting offset position of placeholder element
   * - startSprite: number of the first sprite to show when done loading
   * - onLoaded: callback that will be called when loading has finished
   *
   * Element can be a css selector or existing DOM element or null, in which case a new div element will be created
   *
   * Debug adds logging in console, useful when working on the animation
   *
   * @param {object} options
   * @param {HTMLElement | string} element
   * @param {boolean} debug
   */
  constructor(
    options: SpriteSheetOptions,
    element: HTMLElement | string,
    debug: boolean = false
  ) {
    // Lookup element by selector
    if (element) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element
    }

    // No element found, let's create one instead
    if (!this.element) {
      if (typeof this.element !== 'undefined') {
        this.log('warn', `element "${element}" not found, created new element instead`)
      }
      this.element = document.createElement('div')
      document.body.appendChild(this.element)
    }

    // Combine options with defaults
    this.spriteSheet = {...this.spriteSheet, ...options}
    this.playhead = {...playheadDefaults}
    this.debug = debug

    // Initialize spritesheet
    if (!options.cols) {
      this.log('error', 'options.cols not set')
    }
    if (!options.rows) {
      this.log('error', 'options.rows not set')
    }
    if (!options.url) {
      // If no sprite is specified try to use background-image
      const elementStyle = window.getComputedStyle(this.element)
      const cssBackgroundImage = elementStyle.getPropertyValue('background-image')
      if (cssBackgroundImage === 'none') {
        this.log('error', 'no spritesheet image found, please specify it with options.url or set as css background')
      } else {
        this.spriteSheet.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '')
      }
    }

    this.loadSpriteSheet()
  }

  /**
   * Stop the current animation and show the specified sprite
   * @param {number} spriteNumber
   */
  public showSprite = (spriteNumber: number) => {
    this.playhead.play = false
    this.drawFrame({sprite: spriteNumber})
  }

  /**
   * Get the current spriteNumber that is shown
   * @returns {number}
   */
  public currentSprite = (): number => {
    return this.playhead.currentSprite
  }

  /**
   * Add a named animation sequence
   *
   * Name can be any string value
   *
   * Script should be an array of frame objects, each can have the following properties
   * - sprite: which sprite to show (mandatory)
   * - delay: alternate delay then the default delay
   * - top/left/bottom/right: reposition the placeholder element
   *
   * @param {string} name
   * @param {Frame[]} script
   */
  public addScript = (name: string, script: Frame[]) => {
    this.spriteSheet.animations[name] = script
  }

  /**
   * Set playback tempo, double-speed = 2, half-speed = .5 (default:1)
   * @param {number} tempo
   */
  public setTempo = (tempo: number) => {
    this.playhead.tempo = tempo
  }

  /**
   * Get playback tempo, double-speed = 2, half-speed = .5 (default:1)
   * @returns {number}
   */
  public getTempo = (): number => {
    return this.playhead.tempo
  }

  /**
   * Step the animation ahead one frame
   * @returns {boolean}
   */
  public next = (): boolean => {
    if (!this.spriteSheet.loaded) {
      return false
    }

    // Update counter
    this.playhead.currentFrame += 1
    if (this.playhead.currentFrame > (this.playhead.script.length - 1)) {
      this.playhead.currentFrame = 0
    }
    if (this.playhead.currentFrame === this.playhead.script.length - 1) {
      this.playhead.run -= 1
    }

    const frame = this.playhead.script[this.playhead.currentFrame]
    return this.drawFrame(frame)
  }

  /**
   * Step the animation backwards one frame
   * @returns {boolean}
   */
  public previous = (): boolean => {
    if (!this.spriteSheet.loaded) {
      return false
    }

    // Update counter
    this.playhead.currentFrame -= 1
    if (this.playhead.currentFrame < 0) {
      this.playhead.currentFrame = (this.playhead.script.length - 1)
    }
    if (this.playhead.currentFrame === 0) {
      this.playhead.run -= 1
    }

    const frame = this.playhead.script[this.playhead.currentFrame]
    return this.drawFrame(frame)
  }

  /**
   * Jump to certain frame within current animation sequence
   * @param frameNumber [integer]
   * @returns {boolean}
   */
  public goTo = (frameNumber: number): boolean => {
    if (!this.spriteSheet.loaded) {
      return false
    }

    // Make sure given frame is within the animation
    const baseNumber = Math.floor(frameNumber / this.playhead.script.length)
    frameNumber = Math.floor(frameNumber - (baseNumber * this.playhead.script.length))

    // Draw frame
    this.playhead.currentFrame = frameNumber
    const frame = this.playhead.script[this.playhead.currentFrame]
    if (frame !== undefined) {
      return false
    }

    this.log('info', 'frame: ' + this.playhead.currentFrame + ', sprite: ' + frame.sprite)
    return this.drawFrame(frame)
  }

  /**
   * Resume/play current or given animation.
   * Method can be called in four ways:
   *
   * .play() - resume current animation sequence (if not set - loops over all sprites once)
   * .play(scriptName) - play given animation script
   * .play(scriptName, { options }) - play given animation script with given options
   * .play({ options }) - play current animation with given options
   *
   * ScriptName loads a previously added animation with .addScript()
   *
   * Options object can contain
   * - play: start playing the animation right away (default: true)
   * - run: the number of times the animation should run, -1 is infinite (default: 1)
   * - delay: default delay for all frames that don't have a delay set (default: 50)
   * - tempo: timescale for all delays, double-speed = 2, half-speed = .5 (default:1)
   * - reversed: direction of the animation head, true == backwards (default: false)
   * - outOfViewStop: stop animation if placeholder is no longer in view (default: false)
   * - onPlay/onStop/onFrame: callbacks called at the appropriate times (default: null)
   *
   * @param {string | Animation} scriptName
   * @param {Animation} options
   * @returns {boolean}
   */
  public play = (
    scriptName?: string | AnimationOptions,
    options?: AnimationOptions
  ) => {
    // Not yet loaded, wait...
    if (!this.spriteSheet.loaded) {
      setTimeout(() => {
        this.play(scriptName, options)
      }, 50)
      return false
    }

    // play()
    if (!scriptName && !options) {

      // Play if not already playing
      if (!this.playhead.play) {
        if (this.playhead.run === 0) {
          this.playhead.run = 1
        }
        this.playhead.play = true
      }

    } else {
      let animationScript: Frame[]
      let animationOptions: AnimationOptions = {}

      // play('someAnimation')
      if (typeof scriptName === 'string' && !options) {
        if (this.spriteSheet.animations[scriptName]) {
          this.log('info', `playing animation "${scriptName}"`)
          animationScript = this.spriteSheet.animations[scriptName]
        } else {
          this.log('error', `animation "${scriptName}" not found`)
        }

        // play('someAnimation', { options })
      } else if (typeof scriptName === 'string' && typeof options === 'object') {
        animationScript = this.spriteSheet.animations[scriptName]
        animationOptions = options

        // play({ options })
      } else if (typeof scriptName === 'object' && !options) {
        animationScript = this.playhead.script
        animationOptions = scriptName
      }

      if (!animationScript) {
        this.log('info', `playing animation "all"`)
        animationScript = this.spriteSheet.animations.all
      }
      this.playhead = {
        ...playheadDefaults,
        ...{script: animationScript},
        ...animationOptions
      }
    }

    // Enter the animation loop
    if (this.playhead.run !== 0) {
      this.loop()
    }

    // onPlay callback
    if (typeof this.playhead.onPlay === 'function') {
      this.playhead.onPlay()
    }
  }

  /**
   * Get the current play state
   * @returns {boolean}
   */
  public isPlaying = (): boolean => {
    return this.playhead.play
  }

  /**
   * Reverse direction of play
   */
  public reverse = () => {
    this.playhead.reversed = !this.playhead.reversed
  }

  /**
   * Get the current direction of play
   * @returns {boolean}
   */
  public isReversed = (): boolean => {
    return this.playhead.reversed
  }

  /**
   * Stop the animation
   */
  public stop = () => {
    this.playhead.play = false

    // onStop callback
    if (typeof this.playhead.onStop === 'function') {
      this.playhead.onStop()
    }
  }

  /**
   * Reset playhead to first frame
   */
  public reset = () => {
    this.goTo(0)
  }

  /**
   * Load the spritesheet and position it correctly
   */
  private loadSpriteSheet = () => {
    const preload = new Image()
    preload.src = this.spriteSheet.url

    imageLoaded(preload, () => {
      // Fix for some unexplained firefox bug that loads this twice.
      if (this.spriteSheet.loaded) {
        return
      }

      this.spriteSheet.loaded = true

      this.log('info', 'loaded: ' + this.spriteSheet.url + ', sprites ' + this.spriteSheet.cols + ' x ' +
        this.spriteSheet.rows)

      this.spriteSheet.sheetWidth = preload.width
      this.spriteSheet.sheetHeight = preload.height
      this.spriteSheet.frameWidth = this.spriteSheet.sheetWidth / this.spriteSheet.cols
      this.spriteSheet.frameHeight = this.spriteSheet.sheetHeight / this.spriteSheet.rows
      this.spriteSheet.totalSprites = (this.spriteSheet.cols * this.spriteSheet.rows) - this.spriteSheet.cutOffFrames

      if (this.spriteSheet.frameWidth % 1 !== 0) {
        this.log('error', 'frameWidth ' + this.spriteSheet.frameWidth + ' is not a whole number')
      }
      if (this.spriteSheet.frameHeight % 1 !== 0) {
        this.log('error', 'frameHeight ' + this.spriteSheet.frameHeight + ' is not a whole number')
      }

      this.element.style.position = 'absolute'
      this.element.style.width = `${this.spriteSheet.frameWidth}px`
      this.element.style.height = `${this.spriteSheet.frameHeight}px`
      this.element.style.backgroundImage = `url(${this.spriteSheet.url})`
      this.element.style.backgroundPosition = '0 0'

      if (this.spriteSheet.top !== null) {
        if (this.spriteSheet.top === 'center') {
          this.element.style.top = '50%'
          this.element.style.marginTop = `${this.spriteSheet.frameHeight / 2 * -1}px`
        } else {
          this.element.style.top = `${this.spriteSheet.top}px`
        }
      }
      if (this.spriteSheet.right !== null) {
        this.element.style.right = `${this.spriteSheet.right}px`
      }
      if (this.spriteSheet.bottom !== null) {
        this.element.style.bottom = `${this.spriteSheet.bottom}px`
      }
      if (this.spriteSheet.left !== null) {
        if (this.spriteSheet.left === 'center') {
          this.element.style.left = `${this.spriteSheet.left}px`
          this.element.style.marginLeft = `${this.spriteSheet.frameWidth / 2 * -1}px`
        } else {
          this.element.style.left = `${this.spriteSheet.left}px`
        }
      }

      // Auto script the first 'all' animation sequence and make it default
      this.autoScript()
      const animationOptions = {script: this.spriteSheet.animations.all}
      this.playhead = {...playheadDefaults, ...animationOptions}

      // Starting sprite?
      if (this.spriteSheet.startSprite > 1 && this.spriteSheet.startSprite <= this.spriteSheet.totalSprites) {
        this.showSprite(this.spriteSheet.startSprite)
      }

      // onLoaded callback
      if (typeof this.spriteSheet.onLoaded === 'function') {
        this.spriteSheet.onLoaded()
      }
    })
  }

  /**
   * Generate a linear script based on the spritesheet itself
   */
  private autoScript = () => {
    const script = []
    for (let i = 0; i < this.spriteSheet.totalSprites; i++) {
      script[i] = {sprite: (i + 1)}
    }
    this.addScript('all', script)
  }

  /**
   * The animation loop
   */
  private loop = (time?: number) => {
    // Should be called as soon as possible
    const requestFrameId = raf(this.loop)

    // Wait until fully loaded
    if (this.element !== null && this.spriteSheet.loaded) {

      // Only play when not paused
      if (this.playhead.play) {

        // Throttle on nextDelay
        if ((time - this.playhead.lastTime) >= this.playhead.nextDelay) {

          // Render next frame only if element is visible and within viewport
          if (this.element.offsetParent !== null && this.inViewport()) {

            // Only play if run counter is still <> 0
            if (this.playhead.run === 0) {
              this.stop()
            } else {

              if (this.playhead.reversed) {
                this.previous()
              } else {
                this.next()
              }

              const frame = this.playhead.script[this.playhead.currentFrame]
              this.playhead.nextDelay = (frame.delay ? frame.delay : this.playhead.delay)
              this.playhead.nextDelay /= this.playhead.tempo
              this.playhead.lastTime = time

              this.log('info', 'frame: ' + this.playhead.currentFrame + ', sprite: ' + frame.sprite + ', delay: ' +
                this.playhead.nextDelay + ', run: ' + this.playhead.run)
            }

          } else {
            if (this.playhead.play && this.playhead.outOfViewStop) {
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
  private drawFrame = (frame) => {
    if (frame.sprite === this.playhead.currentSprite) {
      return false
    }
    this.playhead.currentSprite = frame.sprite

    const rect = this.element.getBoundingClientRect()
    const row = Math.ceil(frame.sprite / this.spriteSheet.cols)
    const col = frame.sprite - ((row - 1) * this.spriteSheet.cols)
    const bgX = ((col - 1) * this.spriteSheet.frameWidth) * -1
    const bgY = ((row - 1) * this.spriteSheet.frameHeight) * -1

    if (row > this.spriteSheet.rows || col > this.spriteSheet.cols) {
      this.log('error', `position ${frame.sprite} out of bound'`)
    }

    // Animate background
    this.element.style.backgroundPosition = `${bgX}px ${bgY}px`

    // Move if indicated
    if (frame.top) {
      this.element.style.top = `${rect.top + frame.top}px`
    }
    if (frame.right) {
      this.element.style.right = `${rect.right + frame.right}px`
    }
    if (frame.bottom) {
      this.element.style.bottom = `${rect.bottom + frame.bottom}px`
    }
    if (frame.left) {
      this.element.style.left = `${rect.left + frame.left}px`
    }

    // onFrame callback
    if (typeof this.playhead.onFrame === 'function') {
      this.playhead.onFrame(this.playhead.currentFrame)
    }

    return true
  }

  /**
   * Test to see if an element is within the viewport
   * @returns {boolean}
   */
  private inViewport = (): boolean => {
    const rect = this.element.getBoundingClientRect()
    return (
      rect.top + this.spriteSheet.frameHeight >= 0 &&
      rect.left + this.spriteSheet.frameWidth >= 0 &&
      rect.bottom - this.spriteSheet.frameHeight <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right - this.spriteSheet.frameWidth <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  /**
   * Log utility method
   * @param level
   * @param message
   * @private
   */
  private log = (level, message) => {
    if (typeof console === 'undefined' || (level === 'info' && !this.debug)) {
      return
    }
    console[level](`Spriteling: ${message}`)
  }
}

export default Spriteling
