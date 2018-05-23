const imageLoaded = require('image-loaded')
const raf = require('raf')

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

  _options = {}

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

  constructor (options, element = false) {
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
      this._element.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 10000; color: blue; border: 10px solid red; width: 100px; height: 100px;'
      document.body.appendChild(this._element)
    }

    // Combine options with defaults
    this._options = Object.assign({}, this.spriteDefaults, options)

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
        this._options.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '')
      }
    }

    this._load()
    console.log(this._options.url)
    console.log('@', element, this._element)
  }

  /**
   * Show certain sprite (circumvents the current animation sequence)
   */
  showSprite (spriteNumber) {
    this._playhead.play = false
    this._drawFrame({sprite: spriteNumber})
  }

  /**
   * Get the current spriteNumber that is shown
   */
  currentSprite () {
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
  addScript (name, script) {
    // TODO: type validation
    this._internal.animations[name] = script
  }

  setTempo (tempo) {
    this._playhead.tempo = tempo
  }

  /**
   * Get the current frame
   */
  current () {
    return this._playhead.currentFrame
  }

  /**
   * Go forward one frame
   */
  next () {
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
  previous () {
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
  goTo (frameNumber) {
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
  play (animationObject) {
    // Not yet loaded, wait...
    if (!this._internal.loaded) {
      setTimeout(() => { this._play(animationObject) }, 50)
      return false
    }

    if (typeof animationObject === 'object') {
      if (typeof animationObject.script === 'string') { // Resolve to stored animation sequence
        animationObject.script = this._internal.animations[animationObject.script]
      }
      if (typeof animationObject.script === 'undefined') {
        animationObject.script = this._internal.animations['all']
      }
      this._playhead = Object.assign({}, this.animationDefaults, animationObject)
    } else {
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
      this._.playhead.onPlay.call($element.data('spriteAnimator'))
    }
  }

  /**
   * Reverse direction of play
   */
  reverse () {
    this._playhead.reversed = !this._playhead.reversed
  }

  /**
   * Stop the animation
   */
  stop () {
    this._playhead.play = false

    // onStop callback
    // if (typeof plugin.playhead.onStop === 'function') {
    //   plugin.playhead.onStop.call($element.data('spriteAnimator'));
    // }
  }

  /**
   * Reset playhead to first frame
   */
  reset () {
    this.goTo(0)
  }

  /**
   * Load the spritesheet and position it correctly
   */
  _load () {
    const _preload = new Image()
    _preload.src = this._options.url

    imageLoaded(_preload, () => {
      if (this._internal.loaded) { return } // <- Fix for some unexplained firefox bug that loads this twice.
      this._internal.loaded = true

      this._log('info', 'Loaded: ' + this._options.url + ', sprites ' + this._options.cols + ' x ' + this._options.rows)

      this._internal.sheetWidth = _preload.width
      this._internal.sheetHeight = _preload.height
      this._internal.frameWidth = parseInt(this._internal.sheetWidth / this._options.cols, 10)
      this._internal.frameHeight = parseInt(this._internal.sheetHeight / this._options.rows, 10)
      this._internal.totalSprites = (this._options.cols * this._options.rows) - this._options.cutOffFrames

      if (this._internal.frameWidth % 1 !== 0) {
        this._log('error', 'frameWidth ' + this._internal.frameWidth + ' is not a whole number')
      }
      if (this._internal.frameHeight % 1 !== 0) {
        this._log('error', 'frameHeight ' + this._internal.frameHeight + ' is not a whole number')
      }

      this._element.setAttribute('style', `
        position: absolute;
        width: ${this._internal.frameWidth};
        height: ${this._internal.frameHeight};
        background-image: 'url(${this._options.url})';
        background-position: '0 0';
      `)

      if (this._options.top !== null) {
        if (this._options.top === 'center') {
          this._element.setAttribute('style', `
            top: 50%;
            margin-top: ${this._internal.frameHeight / 2 * -1};
          `)
        } else {
          this._element.setAttribute('style', `top: ${this._options.top};`)
        }
      }
      if (this._options.right !== null) {
        this._element.setAttribute('style', `right: ${this._options.right};`)
      }
      if (this._options.bottom !== null) {
        this._element.setAttribute('style', `bottom: ${this._options.bottom};`)
      }
      if (this._options.left !== null) {
        if (this._options.left === 'center') {
          this._element.setAttribute('style', `
            left: ${this._options.left};
            margin-left: ${this._internal.frameWidth / 2 * -1};
          `)
        } else {
          this._element.setAttribute('style', `left: ${this._options.left};`)
        }
      }

      // Auto script the first 'all' animation sequence and make it default
      this._autoScript()
      const animationObject = {script: this._internal.animations['all']}
      this.playhead = Object.assign({}, this.animationDefaults, animationObject)

      // Starting sprite?
      if (this._options.startSprite > 1 && this._options.startSprite <= this._internal.totalSprites) {
        this.showSprite(this._options.startSprite)
      }

      // onLoaded callback
      // if (typeof this._options.onLoaded === 'function') {
      //   this._options.onLoaded.call($element.data('spriteAnimator'))
      // }
    })
  }

  /**
   * Generate a linear script based on the spritesheet itself
   */
  _autoScript () {
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

    //console.log(requestFrameId);

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
  _drawFrame (frame) {
    if (frame.sprite === this._playhead.currentSprite) { return false }
    this._playhead.currentSprite = frame.sprite

    const row = Math.ceil(frame.sprite / this._options.cols)
    const col = frame.sprite - ((row - 1) * this._options.cols)
    const bgX = ((col - 1) * this._internal.frameWidth) * -1
    const bgY = ((row - 1) * this._internal.frameHeight) * -1

    if (row > this._options.rows || col > this._options.cols) {
      this._log('error', `position ${frame.sprite} out of bound'`)
    }

    // Animate background
    this._element.setAttribute('style', `background-position: ${bgX}px ${bgY}px;`)
    const rect = this._element.getBoundingClientRect()

    // Move if indicated
    if (frame.top) {
      this._element.setAttribute('style', `top: ${rect.top + frame.top}px;`)
    }
    if (frame.right) {
      this._element.setAttribute('style', `right: ${rect.right + frame.right}px;`)
    }
    if (frame.bottom) {
      this._element.setAttribute('style', `bottom: ${rect.bottom + frame.bottom}px;`)
    }
    if (frame.left) {
      this._element.setAttribute('style', `left: ${rect.left + frame.left}px;`)
    }

    // onFrame callback
    // if (typeof this._playhead.onFrame === 'function') {
    //   this._playhead.onFrame.call($element.data('spriteAnimator'))
    // }
  }

  /**
   * Log utility method
   * @param level
   * @param message
   * @private
   */
  _log (level, message) {
    console[level](`SpriteLing: ${message}`)
  }
}

export default Spriteling