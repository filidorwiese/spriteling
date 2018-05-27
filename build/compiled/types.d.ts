export declare type SpriteSheet = {
    loaded: boolean;
    debug: boolean;
    url: string;
    cols: number;
    rows: number;
    cutOffFrames: number;
    top: number | 'center';
    bottom: number;
    left: number | 'center';
    right: number;
    startSprite: number;
    totalSprites: number;
    sheetWidth: number;
    sheetHeight: number;
    frameWidth: number;
    frameHeight: number;
    animations: {
        [key: string]: Frame[];
    };
    onLoaded: () => void;
};
export declare type Frame = {
    sprite: number;
    delay: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare type Animation = {
    play: boolean;
    delay: number;
    tempo: number;
    run: number;
    reversed: boolean;
    outOfViewStop: boolean;
    script: Frame[];
    lastTime: number;
    nextDelay: number;
    currentFrame: number;
    currentSprite: number;
    onPlay: () => void;
    onStop: () => void;
    onFrame: () => void;
};
export declare type Internal = {};
