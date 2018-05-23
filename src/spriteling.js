"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var image_loaded_1 = require("image-loaded");
var raf_1 = require("raf");
var Spriteling = /** @class */ (function () {
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
    function Spriteling(options, element) {
        var _this = this;
        this.spriteSheetDefaults = {
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
            onLoaded: null,
        };
        this.animationDefaults = {
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
            onFrame: null,
        };
        this.internal = {
            loaded: false,
            totalSprites: 0,
            sheetWidth: 0,
            sheetHeight: 0,
            frameWidth: 0,
            frameHeight: 0,
            animations: {},
        };
        /**
         * Show certain sprite (circumvents the current animation sequence)
         */
        this.showSprite = function (spriteNumber) {
            _this.playhead.play = false;
            _this.drawFrame({ sprite: spriteNumber });
        };
        /**
         * Get the current spriteNumber that is shown
         */
        this.currentSprite = function () {
            return _this.playhead.currentSprite;
        };
        /**
         * Add a named animation sequence
         * @name: string
         * @script: array with objects as frames, eg [{sprite: 1, delay: 200}, {sprite: 3, top:1 }]
         *          each frame can have the following properties
         *          - sprite: which sprite to show (mandatory)
         *          - delay: alternate delay then the default delay
         *          - top/left/bottom/right: reposition the placeholder
         */
        this.addScript = function (name, script) {
            _this.internal.animations[name] = script;
        };
        this.setTempo = function (tempo) {
            _this.playhead.tempo = tempo;
        };
        /**
         * Get the current frame
         */
        this.current = function () {
            return _this.playhead.currentFrame;
        };
        /**
         * Go forward one frame
         */
        this.next = function () {
            if (!_this.internal.loaded) {
                return false;
            }
            // Update counter
            _this.playhead.currentFrame += 1;
            if (_this.playhead.currentFrame > (_this.playhead.script.length - 1)) {
                _this.playhead.currentFrame = 0;
            }
            if (_this.playhead.currentFrame === _this.playhead.script.length - 1) {
                _this.playhead.run -= 1;
            }
            var frame = _this.playhead.script[_this.playhead.currentFrame];
            _this.drawFrame(frame);
        };
        /**
         * Go back one frame
         */
        this.previous = function () {
            if (!_this.internal.loaded) {
                return false;
            }
            // Update counter
            _this.playhead.currentFrame -= 1;
            if (_this.playhead.currentFrame < 0) {
                _this.playhead.currentFrame = (_this.playhead.script.length - 1);
            }
            if (_this.playhead.currentFrame === 0) {
                _this.playhead.run -= 1;
            }
            var frame = _this.playhead.script[_this.playhead.currentFrame];
            _this.drawFrame(frame);
        };
        /**
         * Jump to certain frame within current animation sequence
         * @param frameNumber [integer]
         * @returns {boolean}
         */
        this.goTo = function (frameNumber) {
            if (!_this.internal.loaded) {
                return false;
            }
            // Make sure given frame is within the animation
            var baseNumber = Math.floor(frameNumber / _this.playhead.script.length);
            frameNumber = Math.floor(frameNumber - (baseNumber * _this.playhead.script.length));
            // Draw frame
            _this.playhead.currentFrame = frameNumber;
            var frame = _this.playhead.script[_this.playhead.currentFrame];
            if (frame !== undefined) {
                _this.log('info', 'frame: ' + _this.playhead.currentFrame + ', sprite: ' + frame.sprite);
                _this.drawFrame(frame);
            }
        };
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
        this.play = function (scriptName, animationObject) {
            // Not yet loaded, wait...
            if (!_this.internal.loaded) {
                setTimeout(function () {
                    _this.play(scriptName, animationObject);
                }, 50);
                return false;
            }
            if (scriptName) {
                // No script provided
                if (typeof scriptName === 'object') {
                    animationObject = scriptName;
                }
                // Resolve animation script
                if (typeof animationObject === 'object') {
                    // Script provided
                    if (typeof animationObject.script === 'string') {
                        animationObject.script = _this.internal.animations[animationObject.script];
                    }
                    if (typeof animationObject.script === 'string') {
                        animationObject.script = _this.internal.animations[animationObject.script];
                    }
                    if (typeof animationObject.script === 'undefined') {
                        animationObject.script = _this.internal.animations.all;
                    }
                    _this.log('info', "playing animation \"" + animationObject.script + "\"");
                }
                _this.playhead = __assign({}, _this.animationDefaults, animationObject);
            }
            else {
                // Play if not already playing
                if (!_this.playhead.play) {
                    if (_this.playhead.run === 0) {
                        _this.playhead.run = 1;
                    }
                    _this.playhead.play = true;
                    _this.loop();
                }
            }
            // Enter the animation loop
            if (_this.playhead.run !== 0) {
                _this.loop();
            }
            // onPlay callback
            if (typeof _this.playhead.onPlay === 'function') {
                _this.playhead.onPlay();
            }
        };
        /**
         * Reverse direction of play
         */
        this.reverse = function () {
            _this.playhead.reversed = !_this.playhead.reversed;
        };
        /**
         * Stop the animation
         */
        this.stop = function () {
            _this.playhead.play = false;
            // onStop callback
            if (typeof _this.playhead.onStop === 'function') {
                _this.playhead.onStop();
            }
        };
        /**
         * Reset playhead to first frame
         */
        this.reset = function () {
            _this.goTo(0);
        };
        /**
         * Load the spritesheet and position it correctly
         */
        this.loadSpriteSheet = function () {
            var preload = new Image();
            preload.src = _this.spriteSheet.url;
            image_loaded_1.default(preload, function () {
                if (_this.internal.loaded) {
                    return;
                } // <- Fix for some unexplained firefox bug that loads this twice.
                _this.internal.loaded = true;
                _this.log('info', 'loaded: ' + _this.spriteSheet.url + ', sprites ' + _this.spriteSheet.cols + ' x ' +
                    _this.spriteSheet.rows);
                _this.internal.sheetWidth = preload.width;
                _this.internal.sheetHeight = preload.height;
                _this.internal.frameWidth = _this.internal.sheetWidth / _this.spriteSheet.cols;
                _this.internal.frameHeight = _this.internal.sheetHeight / _this.spriteSheet.rows;
                _this.internal.totalSprites = (_this.spriteSheet.cols * _this.spriteSheet.rows) - _this.spriteSheet.cutOffFrames;
                if (_this.internal.frameWidth % 1 !== 0) {
                    _this.log('error', 'frameWidth ' + _this.internal.frameWidth + ' is not a whole number');
                }
                if (_this.internal.frameHeight % 1 !== 0) {
                    _this.log('error', 'frameHeight ' + _this.internal.frameHeight + ' is not a whole number');
                }
                _this.element.style.position = 'absolute';
                _this.element.style.width = _this.internal.frameWidth + "px";
                _this.element.style.height = _this.internal.frameHeight + "px";
                _this.element.style.backgroundImage = "url(" + _this.spriteSheet.url + ")";
                _this.element.style.backgroundPosition = '0 0';
                if (_this.spriteSheet.top !== null) {
                    if (_this.spriteSheet.top === 'center') {
                        _this.element.style.top = '50%';
                        _this.element.style.marginTop = _this.internal.frameHeight / 2 * -1 + "px";
                    }
                    else {
                        _this.element.style.top = _this.spriteSheet.top + "px";
                    }
                }
                if (_this.spriteSheet.right !== null) {
                    _this.element.style.right = _this.spriteSheet.right + "px";
                }
                if (_this.spriteSheet.bottom !== null) {
                    _this.element.style.bottom = _this.spriteSheet.bottom + "px";
                }
                if (_this.spriteSheet.left !== null) {
                    if (_this.spriteSheet.left === 'center') {
                        _this.element.style.left = _this.spriteSheet.left + "px";
                        _this.element.style.marginLeft = _this.internal.frameWidth / 2 * -1 + "px";
                    }
                    else {
                        _this.element.style.left = _this.spriteSheet.left + "px";
                    }
                }
                // Auto script the first 'all' animation sequence and make it default
                _this.autoScript();
                var animationObject = { script: _this.internal.animations.all };
                _this.playhead = __assign({}, _this.animationDefaults, animationObject);
                // Starting sprite?
                if (_this.spriteSheet.startSprite > 1 && _this.spriteSheet.startSprite <= _this.internal.totalSprites) {
                    _this.showSprite(_this.spriteSheet.startSprite);
                }
                // onLoaded callback
                if (typeof _this.spriteSheet.onLoaded === 'function') {
                    _this.spriteSheet.onLoaded();
                }
            });
        };
        /**
         * Generate a linear script based on the spritesheet itself
         */
        this.autoScript = function () {
            var script = [];
            for (var i = 0; i < _this.internal.totalSprites; i++) {
                script[i] = { sprite: (i + 1) };
            }
            _this.addScript('all', script);
        };
        /**
         * The animation loop
         */
        this.loop = function (time) {
            // Should be called as soon as possible
            var requestFrameId = raf_1.default(_this.loop);
            // Wait until fully loaded
            if (_this.element !== null && _this.internal.loaded) {
                // Only play when not paused
                if (_this.playhead.play) {
                    // Throttle on nextDelay
                    if ((time - _this.playhead.lastTime) >= _this.playhead.nextDelay) {
                        // Render next frame only if element is visible and within viewport
                        if (_this.element.offsetParent !== null) { // && _inViewport(this.element)
                            // Only play if run counter is still <> 0
                            if (_this.playhead.run === 0) {
                                _this.stop();
                            }
                            else {
                                if (_this.playhead.reversed) {
                                    _this.previous();
                                }
                                else {
                                    _this.next();
                                }
                                var frame = _this.playhead.script[_this.playhead.currentFrame];
                                _this.playhead.nextDelay = (frame.delay ? frame.delay : _this.playhead.delay);
                                _this.playhead.nextDelay /= _this.playhead.tempo;
                                _this.playhead.lastTime = time;
                                _this.log('info', 'frame: ' + _this.playhead.currentFrame + ', sprite: ' + frame.sprite + ', delay: ' +
                                    _this.playhead.nextDelay + ', run: ' + _this.playhead.run);
                            }
                        }
                        else {
                            if (_this.playhead.outOfViewStop) {
                                _this.stop();
                            }
                        }
                    }
                }
                else {
                    // Cancel animation loop if play = false
                    raf_1.default.cancel(requestFrameId);
                }
            }
        };
        /**
         * Draw a single frame
         */
        this.drawFrame = function (frame) {
            if (frame.sprite === _this.playhead.currentSprite) {
                return false;
            }
            _this.playhead.currentSprite = frame.sprite;
            var row = Math.ceil(frame.sprite / _this.spriteSheet.cols);
            var col = frame.sprite - ((row - 1) * _this.spriteSheet.cols);
            var bgX = ((col - 1) * _this.internal.frameWidth) * -1;
            var bgY = ((row - 1) * _this.internal.frameHeight) * -1;
            if (row > _this.spriteSheet.rows || col > _this.spriteSheet.cols) {
                _this.log('error', "position " + frame.sprite + " out of bound'");
            }
            // Animate background
            _this.element.style.backgroundPosition = bgX + "px " + bgY + "px";
            var rect = _this.element.getBoundingClientRect();
            // Move if indicated
            if (frame.top) {
                _this.element.style.top = rect.top + frame.top + "px";
            }
            if (frame.right) {
                _this.element.style.top = rect.right + frame.right + "px";
            }
            if (frame.bottom) {
                _this.element.style.top = rect.bottom + frame.bottom + "px";
            }
            if (frame.left) {
                _this.element.style.top = rect.left + frame.left + "px";
            }
            // onFrame callback
            if (typeof _this.playhead.onFrame === 'function') {
                _this.playhead.onFrame();
            }
        };
        /**
         * Log utility method
         * @param level
         * @param message
         * @private
         */
        this.log = function (level, message) {
            if (level === 'info' && !_this.spriteSheet.debug) {
                return;
            }
            console[level]("SpriteLing: " + message);
        };
        // Lookup element by selector
        if (element && typeof element === 'string') {
            this.element = document.querySelector(element);
            if (!this.element) {
                this.log('warn', "element \"" + element + "\" not found, created new element instead");
            }
        }
        // No element found, let's create one instead
        if (!this.element) {
            this.element = document.createElement('div');
            document.body.appendChild(this.element);
        }
        // Combine options with defaults
        this.spriteSheet = __assign({}, this.spriteSheetDefaults, options);
        // Initialize spritesheet
        if (!options.cols) {
            this.log('error', 'options.cols not set');
        }
        if (!options.rows) {
            this.log('error', 'options.rows not set');
        }
        if (!options.url) {
            // If no sprite is specified try to use background-image
            var elementStyle = window.getComputedStyle(this.element);
            var cssBackgroundImage = elementStyle.getPropertyValue('background-image');
            if (cssBackgroundImage === 'none') {
                this.log('error', 'no spritesheet image found, please specify it with options.url or set as css background');
            }
            else {
                this.spriteSheet.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '');
            }
        }
        this.loadSpriteSheet();
    }
    return Spriteling;
}());
exports.default = Spriteling;
