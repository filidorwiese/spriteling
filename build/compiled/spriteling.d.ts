import { AnimationOptions, Frame, SpriteSheetOptions } from './types';
declare class Spriteling {
    private spriteSheet;
    private playhead;
    private readonly element;
    private debug;
    /**
     * Creates a new Spritling instance. The options object can contain the following values
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
    constructor(options: SpriteSheetOptions, element: HTMLElement | string, debug?: boolean);
    /**
     * Stop the current animation and show the specified sprite
     * @param {number} spriteNumber
     */
    showSprite: (spriteNumber: number) => void;
    /**
     * Get the current spriteNumber that is shown
     * @returns {number}
     */
    currentSprite: () => number;
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
    addScript: (name: string, script: Frame[]) => void;
    /**
     * Set playback tempo, double-speed = 2, half-speed = .5 (default:1)
     * @param {number} tempo
     */
    setTempo: (tempo: number) => void;
    /**
     * Get current playback tempo
     * @returns {number}
     */
    getTempo: () => number;
    /**
     * Step the animation forward one frame
     * @returns {boolean}
     */
    next: () => boolean;
    /**
     * Step the animation backwards one frame
     * @returns {boolean}
     */
    previous: () => boolean;
    /**
     * Jump to certain frame within current animation sequence
     * @param frameNumber [integer]
     * @returns {boolean}
     */
    goTo: (frameNumber: number) => boolean;
    /**
     * Resumes/plays current or given animation.
     * Method can be called in four ways:
     *
     * .play() - resume current animation sequence (if not set - loops over all sprites once)
     * .play(scriptName) - play given animation script
     * .play(scriptName, { options }) - play given animation script with given options
     * .play({ options }) - play current animation with given options
     *
     * Options object can contain
     * - play: start playing the animation right away (default: true)
     * - run: the number of times the animation should run, -1 is infinite (default: 1)
     * - delay: default delay for all frames that don't have a delay set (default: 50)
     * - tempo: timescale for all delays, double-speed = 2, half-speed = .5 (default:1)
     * - reversed: direction of the animation head, true == backwards (default: false)
     * - outOfViewStop: stop animation if placeholder is no longer in view (default: false)
     * - script: new animation array or string (in which case animation sequence is looked up)
     * - onPlay/onStop/onFrame: callbacks called at the appropriate times (default: null)
     *
     * @param {string | Animation} scriptName
     * @param {Animation} options
     * @returns {boolean}
     */
    play: (scriptName?: string | AnimationOptions, options?: AnimationOptions) => boolean;
    /**
     * Get the current play state
     * @returns {boolean}
     */
    isPlaying: () => boolean;
    /**
     * Reverse direction of play
     */
    reverse: () => void;
    /**
     * Get the current direction of play
     * @returns {boolean}
     */
    isReversed: () => boolean;
    /**
     * Stop the animation
     */
    stop: () => void;
    /**
     * Reset playhead to first frame
     */
    reset: () => void;
    /**
     * Load the spritesheet and position it correctly
     */
    private loadSpriteSheet;
    /**
     * Generate a linear script based on the spritesheet itself
     */
    private autoScript;
    /**
     * The animation loop
     */
    private loop;
    /**
     * Draw a single frame
     */
    private drawFrame;
    /**
     * Test to see if an element is within the viewport
     * @returns {boolean}
     */
    private inViewport;
    /**
     * Log utility method
     * @param level
     * @param message
     * @private
     */
    private log;
}
export default Spriteling;
