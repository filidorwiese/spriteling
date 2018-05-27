import { Animation, Frame } from './types';
declare class Spriteling {
    private spriteSheet;
    private playhead;
    private readonly element;
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
    constructor(options: any, element: HTMLElement | string);
    /**
     * Show certain sprite (circumvents the current animation sequence)
     */
    showSprite: (spriteNumber: number) => void;
    /**
     * Get the current spriteNumber that is shown
     */
    currentSprite: () => number;
    /**
     * Add a named animation sequence
     * @name: string
     * @script: array with objects as frames, eg [{sprite: 1, delay: 200}, {sprite: 3, top:1 }]
     *          each frame can have the following properties
     *          - sprite: which sprite to show (mandatory)
     *          - delay: alternate delay then the default delay
     *          - top/left/bottom/right: reposition the placeholder
     */
    addScript: (name: string, script: Frame[]) => void;
    setTempo: (tempo: number) => void;
    getTempo: () => number;
    /**
     * Go forward one frame
     */
    next: () => boolean;
    /**
     * Go back one frame
     */
    previous: () => boolean;
    /**
     * Jump to certain frame within current animation sequence
     * @param frameNumber [integer]
     * @returns {boolean}
     */
    goTo: (frameNumber: number) => boolean;
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
    play: (scriptName?: string | Animation, animationObject?: Animation) => boolean;
    /**
     * Get the current play state
     */
    isPlaying: () => boolean;
    /**
     * Reverse direction of play
     */
    reverse: () => void;
    /**
     * Get the current play state
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
