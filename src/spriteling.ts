import 'es6-promise/auto'
import imageLoaded from 'image-loaded'
import raf from 'raf'
import {Animation, AnimationOptions, Frame, SpriteSheet, SpriteSheetOptions} from './types'

const playheadDefaults: Animation = {
  play: true,
  delay: 50,
  tempo: 1,
  run: -1,
  reversed: false,
  script: [],
  lastTime: 0,
  nextDelay: 0,
  currentFrame: 0,
  currentSprite: 1,
  onPlay: null,
  onStop: null,
  onFrame: null,
  onOutOfView: null
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
    downsizeRatio: 1,
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

  private loadingPromise: Promise<void>

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
    element?: HTMLElement | string,
    debug: boolean = false
  ) {
    // Lookup element by selector
    if (typeof element === 'string') {
      this.element = document.querySelector(element) as HTMLElement
    } else if (element) {
      this.element = element
    }

    // No element found, let's create one instead
    if (!this.element) {
      if (typeof this.element !== 'undefined') {
        this.log('warn', `element "${element}" not found, created new element instead`)
      }
      this.element = document.createElement('div')
      document.body.appendChild(this.element)
    }

    // Add spriteling class
    this.element.className = 'spriteling'

    // Combine options with defaults
    this.spriteSheet = {...this.spriteSheet, ...options}
    this.playhead = {...playheadDefaults}
    this.debug = debug || false

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
      if (!cssBackgroundImage || cssBackgroundImage === 'none') {
        this.log('error', 'no spritesheet image found, please specify it with options.url or set as css background')
      } else {
        this.spriteSheet.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '')
      }
    }

    // Create loading promise
    this.loadingPromise = this.loadSpriteSheet().then(() => {
      this.spriteSheet.loaded = true

      // If starting sprite is set, show it
      if (this.spriteSheet.startSprite > 1 && this.spriteSheet.startSprite <= this.spriteSheet.totalSprites) {
        this.drawFrame({sprite: this.spriteSheet.startSprite})
      }

      // onLoaded callback
      if (typeof this.spriteSheet.onLoaded === 'function') {
        this.spriteSheet.onLoaded()
      }
    })
  }

  /**
   * Stop the current animation and show the specified sprite
   * @param {number} spriteNumber
   */
  public async showSprite(
    spriteNumber: number
  ): Promise<void> {
    await this.loadingPromise

    this.playhead.play = false

    this.drawFrame({sprite: spriteNumber})
  }

  /**
   * Get the current spriteNumber that is shown
   * @returns {number}
   */
  public currentSprite(): number {
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
  public addScript(name: string, script: Frame[]) {
    this.spriteSheet.animations[name] = script
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
   * - script: New unnamed animation sequence, array of frames, see .addScript (default: null)
   * - onPlay/onStop/onFrame/onOutOfView: callbacks called at the appropriate times (default: null)
   *
   * @param {string | Animation} scriptName
   * @param {Animation} options
   * @returns {boolean}
   */
  public async play(
    scriptName?: string | AnimationOptions,
    options?: AnimationOptions
  ): Promise<void> {
    await this.loadingPromise

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
          this.log('warn', `animation "${scriptName}" not found`)
        }

        // play('someAnimation', { options })
      } else if (typeof scriptName === 'string' && typeof options === 'object') {
        animationScript = this.spriteSheet.animations[scriptName]
        animationOptions = options

        // play({ options })
      } else if (typeof scriptName === 'object' && !options) {
        animationScript = scriptName.script || this.playhead.script
        animationOptions = scriptName
      }

      // Fallback to all script
      if (!animationScript) {
        this.log('info', `playing animation "all"`)
        animationScript = this.spriteSheet.animations.all
      }

      // Set starting frame
      let currentFrame = 0
      if (animationOptions.reversed) {
        currentFrame = animationScript.length - 1
      }

      this.playhead = {
        ...playheadDefaults,
        ...{script: animationScript},
        ...animationOptions,
        ...{currentFrame}
      }
    }

    // Enter the animation loop
    if (this.playhead.run !== 0) {
      this.loop(0)
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
  public isPlaying(): boolean {
    return this.playhead.play
  }

  /**
   * Set playback tempo, double-speed = 2, half-speed = .5 (default:1)
   * @param {number} tempo
   */
  public async setTempo(
    tempo: number
  ): Promise<void> {
    await this.loadingPromise

    this.playhead.tempo = tempo
  }

  /**
   * Get playback tempo, double-speed = 2, half-speed = .5 (default:1)
   * @returns {number}
   */
  public getTempo(): number {
    return this.playhead.tempo
  }

  /**
   * Step the animation ahead one frame
   * @returns {boolean}
   */
  public async next(): Promise<void> {
    await this.loadingPromise

    const frame = this.playhead.script[this.playhead.currentFrame]
    this.drawFrame(frame)

    // Update frame counter
    this.playhead.currentFrame += 1

    // End of script?
    if (this.playhead.currentFrame === this.playhead.script.length) {
      this.playhead.run -= 1
      this.playhead.currentFrame = 0
    }
  }

  /**
   * Step the animation backwards one frame
   * @returns {boolean}
   */
  public async previous(): Promise<void> {
    await this.loadingPromise

    const frame = this.playhead.script[this.playhead.currentFrame]
    this.drawFrame(frame)

    // Update frame counter
    this.playhead.currentFrame -= 1

    // End of script?
    if (this.playhead.currentFrame < 0) {
      this.playhead.currentFrame = this.playhead.script.length - 1
      this.playhead.run -= 1
    }
  }

  /**
   * Jump to certain frame within current animation sequence
   * @param frameNumber [integer]
   * @returns {boolean}
   */
  public async goTo(
    frameNumber: number
  ): Promise<void> {
    await this.loadingPromise

    // Make sure given frame is within the animation
    const baseNumber = Math.floor(frameNumber / this.playhead.script.length)
    frameNumber = Math.floor(frameNumber - (baseNumber * this.playhead.script.length))

    // Draw frame
    this.playhead.currentFrame = frameNumber
    const frame = this.playhead.script[this.playhead.currentFrame]
    if (frame) {
      this.log('info', `frame: ${this.playhead.currentFrame}, sprite: ${frame.sprite}`)
      this.drawFrame(frame)
    }
  }

  /**
   * Reverse direction of play
   */
  public async reverse(): Promise<void> {
    await this.loadingPromise

    this.playhead.reversed = !this.playhead.reversed
  }

  /**
   * Get the current direction of play
   * @returns {boolean}
   */
  public isReversed(): boolean {
    return this.playhead.reversed
  }

  /**
   * Stop the animation
   */
  public async stop(): Promise<void> {
    await this.loadingPromise

    this.playhead.play = false

    // onStop callback
    if (typeof this.playhead.onStop === 'function') {
      this.playhead.onStop()
    }
  }

  /**
   * Reset playhead to first frame
   */
  public async reset(): Promise<void> {
    await this.loadingPromise

    this.goTo(0)
  }

  /**
   * Removes the element and kills the animation loop
   */
  public destroy() {
    this.playhead.play = false

    this.element.parentNode.removeChild(this.element)
  }

  /**
   * Load the spritesheet and position it correctly
   */
  private loadSpriteSheet() {
    return new Promise((resolve) => {

      const preload = new Image()
      preload.src = this.spriteSheet.url

      imageLoaded(preload, () => {
        const sheet = this.spriteSheet
        const element = this.element

        this.log('info', `loaded: ${sheet.url}, sprites ${sheet.cols} x ${sheet.rows}`)

        sheet.sheetWidth = preload.width
        sheet.sheetHeight = preload.height
        sheet.frameWidth = sheet.sheetWidth / sheet.cols / sheet.downsizeRatio
        sheet.frameHeight = sheet.sheetHeight / sheet.rows / sheet.downsizeRatio
        sheet.totalSprites = (sheet.cols * sheet.rows) - sheet.cutOffFrames

        if (sheet.frameWidth % 1 !== 0) {
          this.log('error', `frameWidth ${sheet.frameWidth} is not a whole number`)
        }
        if (sheet.frameHeight % 1 !== 0) {
          this.log('error', `frameHeight ${sheet.frameHeight} is not a whole number`)
        }

        element.style.position = 'absolute'
        element.style.width = `${sheet.frameWidth}px`
        element.style.height = `${sheet.frameHeight}px`
        element.style.backgroundImage = `url(${sheet.url})`
        element.style.backgroundPosition = '0 0'

        if (sheet.downsizeRatio > 1) {
          element.style.backgroundSize =
            `${sheet.sheetWidth / sheet.downsizeRatio}px ${sheet.sheetHeight / sheet.downsizeRatio}px`
        }

        if (sheet.top !== null) {
          if (sheet.top === 'center') {
            element.style.top = '50%'
            element.style.marginTop = `${sheet.frameHeight / 2 * -1}px`
          } else {
            element.style.top = `${sheet.top}px`
          }
        }
        if (sheet.right !== null) {
          element.style.right = `${sheet.right}px`
        }
        if (sheet.bottom !== null) {
          element.style.bottom = `${sheet.bottom}px`
        }
        if (sheet.left !== null) {
          if (sheet.left === 'center') {
            element.style.left = `${sheet.left}px`
            element.style.marginLeft = `${sheet.frameWidth / 2 * -1}px`
          } else {
            element.style.left = `${sheet.left}px`
          }
        }

        // Auto script the first 'all' animation sequence and make it default
        this.autoScript()
        const animationOptions = {script: sheet.animations.all}
        this.playhead = {...playheadDefaults, ...animationOptions}

        resolve()
      })
    })
  }

  /**
   * Generate a linear script based on the spritesheet itself
   */
  private autoScript() {
    const script = []
    for (let i = 0; i < this.spriteSheet.totalSprites; i++) {
      script[i] = {sprite: (i + 1)}
    }
    this.addScript('all', script)
  }

  /**
   * The animation loop
   */
  private loop = (time: number) => {
    const requestFrameId = raf(this.loop)
    const playhead = this.playhead

    // Wait until fully loaded
    if (!this.element || !this.spriteSheet.loaded) {
      return
    }

    // Throttle on nextDelay
    if ((time - playhead.lastTime) >= playhead.nextDelay) {
      this.render(time)
    }

    // Cancel animation loop if play = false
    if (!playhead.play) {
      raf.cancel(requestFrameId)
      return
    }
  }

  private render(time: number) {
    const element = this.element
    const playhead = this.playhead

    // Render next frame only if element is visible and within viewport
    if (element.offsetParent !== null && this.inViewport()) {

      // Only play if run counter is still <> 0
      if (playhead.run === 0) {

        this.stop()

      } else {

        if (playhead.reversed) {
          this.previous()
        } else {
          this.next()
        }

        const frame = playhead.script[playhead.currentFrame]
        playhead.nextDelay = frame.delay ? frame.delay : playhead.delay
        playhead.nextDelay /= playhead.tempo
        playhead.lastTime = time

        this.log('info', `run: ${playhead.run}, frame`, frame)
      }

    } else {

      if (typeof playhead.onOutOfView === 'function') {
        playhead.onOutOfView()
      }

    }
  }

  /**
   * Draw a single frame
   */
  private drawFrame(frame) {
    const sheet = this.spriteSheet
    const playhead = this.playhead
    const element = this.element

    if (frame.sprite !== playhead.currentSprite) {

      const rect = element.getBoundingClientRect()
      const row = Math.ceil(frame.sprite / sheet.cols)
      const col = frame.sprite - ((row - 1) * sheet.cols)
      const bgX = ((col - 1) * sheet.frameWidth) * -1
      const bgY = ((row - 1) * sheet.frameHeight) * -1

      if (row > sheet.rows || col > sheet.cols) {
        this.log('warn', `position ${frame.sprite} out of bound`)
      }

      // Set sprite
      playhead.currentSprite = frame.sprite

      // Animate background
      element.style.backgroundPosition = `${bgX}px ${bgY}px`

      // Move if indicated
      if (frame.top) {
        element.style.top = `${rect.top + frame.top}px`
      }
      if (frame.right) {
        element.style.right = `${rect.right + frame.right}px`
      }
      if (frame.bottom) {
        element.style.bottom = `${rect.bottom + frame.bottom}px`
      }
      if (frame.left) {
        element.style.left = `${rect.left + frame.left}px`
      }

    }

    // onFrame callback
    if (typeof playhead.onFrame === 'function') {
      playhead.onFrame(playhead.currentFrame)
    }

    return true
  }

  /**
   * Test to see if an element is within the viewport
   * @returns {boolean}
   */
  private inViewport(): boolean {
    const sheet = this.spriteSheet
    const rect = this.element.getBoundingClientRect()
    return (
      rect.top + sheet.frameHeight >= 0 &&
      rect.left + sheet.frameWidth >= 0 &&
      rect.bottom - sheet.frameHeight <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right - sheet.frameWidth <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  /**
   * Log utility method
   * @param level
   * @param message
   * @private
   */
  private log(level, ...message) {
    if (typeof console === 'undefined' || (level === 'info' && !this.debug)) {
      return
    }
    console[level](`Spriteling`, ...message)
  }
}

export default Spriteling
