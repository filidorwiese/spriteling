export declare type SpriteSheetOptions = {
    url: string;
    cols: number;
    rows: number;
    cutOffFrames: number;
    top: number | 'center';
    bottom: number;
    left: number | 'center';
    right: number;
    startSprite: number;
    onLoaded: () => void;
};
export declare type SpriteSheet = SpriteSheetOptions & {
    loaded: boolean;
    totalSprites: number;
    sheetWidth: number;
    sheetHeight: number;
    frameWidth: number;
    frameHeight: number;
    animations: {
        [key: string]: Frame[];
    };
};
export declare type Frame = {
    sprite: number;
    delay?: number;
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};
export declare type AnimationOptions = {
    play?: boolean;
    delay?: number;
    tempo?: number;
    run?: number;
    reversed?: boolean;
    outOfViewStop?: boolean;
    script?: Frame[];
    onPlay?: () => void;
    onStop?: () => void;
    onFrame?: (frameNumber: number) => void;
};
export declare type Animation = AnimationOptions & {
    script: Frame[];
    lastTime: number;
    nextDelay: number;
    currentFrame: number;
    currentSprite: number;
};
