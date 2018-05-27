import imageLoaded from 'image-loaded'
import raf from 'raf'
import {Animation, Frame, Internal, SpriteSheet} from './types'

class Spriteling {
  private spriteSheetDefaults: SpriteSheet = {
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

  private animationDefaults: Animation = {
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

  private internal: Internal = {
    loaded: false,
    totalSprites: 0,
    sheetWidth: 0,
    sheetHeight: 0,
    frameWidth: 0,
    frameHeight: 0,
    animations: {}
  }

  private spriteSheet: SpriteSheet

  private playhead: Animation

  private readonly element: HTMLElement

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

  constructor(options, element: HTMLElement | string) {
    // Lookup element by selector
    if (element) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element
    }

    // No element found, let's create one instead
    if (!this.element) {
      this.log('warn', `element "${element}" not found, created new element instead`)
      this.element = document.createElement('div')
      document.body.appendChild(this.element)
    }

    // Combine options with defaults
    this.spriteSheet = {...this.spriteSheetDefaults, ...options}
    this.playhead = {...this.animationDefaults}

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
   * Show certain sprite (circumvents the current animation sequence)
   */
  public showSprite = (spriteNumber: number) => {
    this.playhead.play = false
    this.drawFrame({sprite: spriteNumber})
  }

  /**
   * Get the current spriteNumber that is shown
   */
  public currentSprite = (): number => {
    return this.playhead.currentSprite
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
  public addScript = (name: string, script: Frame[]) => {
    this.internal.animations[name] = script
  }

  public setTempo = (tempo: number) => {
    this.playhead.tempo = tempo
  }

  /**
   * Get the current frame
   */
  public current = () => {
    return this.playhead.currentFrame
  }

  /**
   * Go forward one frame
   */
  public next = () => {
    if (!this.internal.loaded) {
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
    this.drawFrame(frame)
  }

  /**
   * Go back one frame
   */
  public previous = () => {
    if (!this.internal.loaded) {
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
    this.drawFrame(frame)
  }

  /**
   * Jump to certain frame within current animation sequence
   * @param frameNumber [integer]
   * @returns {boolean}
   */
  public goTo = (frameNumber: number) => {
    if (!this.internal.loaded) {
      return false
    }

    // Make sure given frame is within the animation
    const baseNumber = Math.floor(frameNumber / this.playhead.script.length)
    frameNumber = Math.floor(frameNumber - (baseNumber * this.playhead.script.length))

    // Draw frame
    this.playhead.currentFrame = frameNumber
    const frame = this.playhead.script[this.playhead.currentFrame]
    if (frame !== undefined) {
      this.log('info', 'frame: ' + this.playhead.currentFrame + ', sprite: ' + frame.sprite)
      this.drawFrame(frame)
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
  public play = (scriptName?: string | Animation, animationObject?: Animation) => {
    // Not yet loaded, wait...
    if (!this.internal.loaded) {
      setTimeout(() => {
        this.play(scriptName, animationObject)
      }, 50)
      return false
    }

    // play()
    if (!scriptName && !animationObject) {

      // Play if not already playing
      if (!this.playhead.play) {
        if (this.playhead.run === 0) {
          this.playhead.run = 1
        }
        this.playhead.play = true
        // this.loop()
      }

    } else {

      // play('someAnimation')
      if (typeof scriptName === 'string' && !animationObject) {
        if (this.internal.animations[scriptName]) {
          this.log('info', `playing animation "${scriptName}"`)
          animationObject = {
            ...this.animationDefaults,
            ...{script: this.internal.animations[scriptName]}
          }
        } else {
          this.log('error', `animation "${scriptName}" not found`)
        }

        // play('someAnimation', { options })
      } else if (typeof scriptName === 'string' && typeof animationObject === 'object') {
        animationObject.script = this.internal.animations[scriptName]

        // play({ options })
      } else if (typeof scriptName === 'object' && !animationObject) {
        animationObject = scriptName

      }

      if (animationObject) {
        if (typeof animationObject.script === 'undefined') {
          this.log('info', `playing animation "all"`)
        }

        this.playhead = {
          ...this.animationDefaults,
          ...{script: this.internal.animations.all},
          ...animationObject
        }
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
   * Reverse direction of play
   */
  public reverse = () => {
    this.playhead.reversed = !this.playhead.reversed
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
      // <- Fix for some unexplained firefox bug that loads this twice.
      if (this.internal.loaded) {
        return
      }

      this.internal.loaded = true

      this.log('info', 'loaded: ' + this.spriteSheet.url + ', sprites ' + this.spriteSheet.cols + ' x ' +
        this.spriteSheet.rows)

      this.internal.sheetWidth = preload.width
      this.internal.sheetHeight = preload.height
      this.internal.frameWidth = this.internal.sheetWidth / this.spriteSheet.cols
      this.internal.frameHeight = this.internal.sheetHeight / this.spriteSheet.rows
      this.internal.totalSprites = (this.spriteSheet.cols * this.spriteSheet.rows) - this.spriteSheet.cutOffFrames

      if (this.internal.frameWidth % 1 !== 0) {
        this.log('error', 'frameWidth ' + this.internal.frameWidth + ' is not a whole number')
      }
      if (this.internal.frameHeight % 1 !== 0) {
        this.log('error', 'frameHeight ' + this.internal.frameHeight + ' is not a whole number')
      }

      this.element.style.position = 'absolute'
      this.element.style.width = `${this.internal.frameWidth}px`
      this.element.style.height = `${this.internal.frameHeight}px`
      this.element.style.backgroundImage = `url(${this.spriteSheet.url})`
      this.element.style.backgroundPosition = '0 0'

      if (this.spriteSheet.top !== null) {
        if (this.spriteSheet.top === 'center') {
          this.element.style.top = '50%'
          this.element.style.marginTop = `${this.internal.frameHeight / 2 * -1}px`
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
          this.element.style.marginLeft = `${this.internal.frameWidth / 2 * -1}px`
        } else {
          this.element.style.left = `${this.spriteSheet.left}px`
        }
      }

      // Auto script the first 'all' animation sequence and make it default
      this.autoScript()
      const animationObject = {script: this.internal.animations.all}
      this.playhead = {...this.animationDefaults, ...animationObject}

      // Starting sprite?
      if (this.spriteSheet.startSprite > 1 && this.spriteSheet.startSprite <= this.internal.totalSprites) {
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
    for (let i = 0; i < this.internal.totalSprites; i++) {
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
    if (this.element !== null && this.internal.loaded) {

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
            if (this.playhead.outOfViewStop) {
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
    const bgX = ((col - 1) * this.internal.frameWidth) * -1
    const bgY = ((row - 1) * this.internal.frameHeight) * -1

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
      this.element.style.top = `${rect.right + frame.right}px`
    }
    if (frame.bottom) {
      this.element.style.top = `${rect.bottom + frame.bottom}px`
    }
    if (frame.left) {
      this.element.style.top = `${rect.left + frame.left}px`
    }

    // onFrame callback
    if (typeof this.playhead.onFrame === 'function') {
      this.playhead.onFrame()
    }
  }

  /**
   * Test to see if an element is within the viewport
   */
  private inViewport = () => {
    const rect = this.element.getBoundingClientRect()
    const aboveTop = (window.scrollY >= rect.top + this.internal.frameHeight)
    const belowFold = (window.innerHeight + window.scrollY <= rect.top)
    const leftOfScreen = (window.scrollX >= rect.left + this.internal.frameWidth)
    const rightOfScreen = (window.innerWidth + window.scrollX <= rect.left)
    return (!aboveTop && !belowFold && !leftOfScreen && !rightOfScreen)
  }

  /**
   * Log utility method
   * @param level
   * @param message
   * @private
   */
  private log = (level, message) => {
    if (level === 'info' && !this.spriteSheet.debug) {
      return
    }
    console[level](`SpriteLing: ${message}`)
  }
}

export default Spriteling
