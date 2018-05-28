# Spriteling

A scriptable spritesheet animation engine that works directly on DOM elements (no canvas). It's build as ES5 compatible JavaScript, has no external dependencies and a tiny footprint (~3KB minified/gzipped).

### Install using node

`npm install --save spriteling`

Then either import, require or use directly as &lt;script&gt; tag:

```js
import Spriteling from 'spriteling'

const Spriteling = require('spriteling')

<script type="text/javascript" src="spriteling.min.js"></script>
```


### Example 1: Basic looping animation

<img src="https://raw.githubusercontent.com/filidorwiese/spriteling/master/examples/artwork/arcade-single.png">

Create a DOM element on the page and give it an id. Pass it to a new instance of Spriteling, giving it some information about the spritesheet and where to put it on the page.
Finally call .play() on it with some optional parameters.

```html
<div id="sprite"></div>
<script>
     const sprite = new Spriteling({
        url: '/spritesheets/arcade.png',
        top: 200,
        left: 100,
        cols: 3,
        rows: 9
    }, '#sprite')
    
    sprite.play({
        run: -1,
        delay: 100
    })
</script>
```

You can see it in action at ["Arcade" animation](https://fili.nl/spriteling-examples/looping-animation-arcade.html)

### Example 2: Scripted animation 

Looping sure is nice! But when we have a non-linear animation to build, we need to have fine-grained control over the individual steps. Like the sequencing of the sprites and timing them correctly. Take this spritesheet of a reading character for example:

<img src="https://raw.githubusercontent.com/filidorwiese/spriteling/master/examples/artwork/spritesheet-reading.png" width="200">

For this animation, simply looping the images won't do. We need to add an animation script to get the desired result: 

```html
<div id="sprite"></div>
<script>
  const sprite = new Spriteling({
    url: '/spritesheets/reading.png',
    top: 200,
    left: 100,
    cols: 5,
    rows: 3
  }, '#sprite', true)

  sprite.addScript('read', [
    // read lines
    {sprite: 1, delay: 1000},
    {sprite: 2, delay: 800},
    {sprite: 1},
    {sprite: 3, delay: 400},
    {sprite: 1},

    // read lines
    {sprite: 2, delay: 800},
    {sprite: 1},
    {sprite: 3, delay: 400},
    {sprite: 1},

    // read lines
    {sprite: 2, delay: 400},
    {sprite: 1},
    {sprite: 3, delay: 800},
    {sprite: 1},

    // blink
    {sprite: 4},
    {sprite: 1},

    // turn page
    {sprite: 5},
    {sprite: 6},
    {sprite: 7},
    {sprite: 8},
    {sprite: 9},
    {sprite: 10},
    {sprite: 11},
    {sprite: 12}
  ])

  sprite.play('read', {
    run: -1,
    delay: 200
  })
</script>
```

You can see it in action at ["Reading" demo](https://fili.nl/spriteling-examples/scripted-animation-reading.html). Another scripted animation can be seen at ["Dog training" demo](https://fili.nl/spriteling-examples/scripted-animation-ossy.html).

### Example 3: Multiple instances
Spriteling is not hardware-accelerated, there is no need for a clunky WebGL canvas element or CSS properties that need GPU support. In fact, under the hood there is nothing more then a background positioning trick doing the hard work, which is as fast as it can get. Even under stress it performs quite well, as you can see in the ["Multiple instances" demo](https://fili.nl/spriteling-examples/scripted-animation-multiple.html)

### More advanced examples
But we shouldn't stop there! When adding positioning to the animation script, we can easily create a walking character. And the character truly comes alive when we add user interaction, like mouse events.

<img src="https://raw.githubusercontent.com/filidorwiese/spriteling/master/examples/artwork/scared.gif">

Feel free to check out these "Spriteling included" websites:

* Website [galaxy.fili.nl](https://galaxy.fili.nl)
* Website [filidorwiese.nl](https://filidorwiese.nl)
* Website [whois.wildlife.la](http://whois.wildlife.la)

Now it's up to you. Please keep me posted on what you've created! 

# API

## constructor(options, element, debug): Spriteling

Create a new Spriteling instance, example usage: 
```js
const sprite = new Spriteling({
  url: '/spritesheets/walking-character.png',
  top: 200,
  left: 100,
  cols: 5,
  rows: 3
}, '#sprite')
```

#### options: `SpriteSheetOptions`

Property | Type | Required | Default&nbsp;value | Explanation
:------------- |:------------- |:-------------:| :-------------:| :-------------
url | `string` | no | null | url to spritesheet, if not set the css background-image will be used
cols | `number` | yes | null | Number of columns in the spritesheet
rows | `number` | yes | null | Number of rows in the spritesheet
cutOffFrames | `number` | no | 0 | Number of sprites not used in the spritesheet, for example the last sprite in a sheet might be blank
top bottom left right | `number` | no |  | Initial position of the placeholder element, will use current if not provided
startSprite | `number` | no | 1 | Sprite number to show when done loading
onLoaded | `function` | no | null | Callback function that will be called when loading has finished

#### element: `HTMLElement | string` (optional)
Can be a CSS selector or existing DOM element or null, in which case a new div element will be created

#### debug: `boolean` (optional)
Can be used to enable debug logging in console, useful when fine-tuning the animation scripts

## .showSprite( sprite: `number`)
Stop the current animation and show the specified sprite

```js
spriteling.showSprite(4)
```

## .currentSprite(): `number`
Get the current spriteNumber that is shown

```js
const currentSprite = spriteling.currentSprite()
```

## .addScript(name: `string`, script: `Array<Frame>`)
Add a named animation sequence, for example:

```js
spriteling.addScript('walk', [
    { sprite:22, delay:100 },
    { sprite:23, delay:100, left: 10 },
    { sprite:24, delay:150, left: 5 },
    { sprite:23, delay:100, left: 10 }
])
```

#### name: `string`
Can be any string value

#### script: `Array<Frame>`
The `script` parameter should be an array consisting of frame objects. These frame objects can have the following properties:


Property | Type | Required | Default&nbsp;value | Explanation
:------------- |:------------- |:-------------:| :-------------:| :-------------
sprite | `number` | yes |  | Which sprite from spritesheet to show (counted from top-left to bottom-right)
delay | `number` | no | delay defined with .play() | Time in ms to wait after this frame has been rendered
top bottom left right | `number` | no | 0 | Move the position of the placeholder to any direction after frame has been rendered

## .setTempo( tempo: `number`)
Set playback tempo, double-speed = 2, half-speed = .5 (default:1)

```js
spriteling.setTempo(2)
```

## .getTempo(): `number`
Get playback tempo, double-speed = 2, half-speed = .5 (default:1)

```js
const tempo = spriteling.getTempo()
```

## .next()
Step the animation ahead one frame

```js
spriteling.next()
```

## .previous()
Step the animation backwards one frame

```js
spriteling.previous()
```

## .goTo(frame: `number`): `boolean`
Jump to certain frame within current animation sequence. Returns true if succeeded.

```js
spriteling.goTo(10)
```

## .play(scriptName: `string`, options: `AnimationOptions`)
Resume/play current or given animation.
Method can be called in four ways:

```js
sprite.play() // resume current animation sequence (if not set - loops over all sprites once)
sprite.play(scriptName) // play given animation script
sprite.play(scriptName, { options }) // play given animation script with given options
sprite.play({ options }) // play current animation with given options
```

#### scriptName: `string`
loads a previously added animation with .addScript()

#### options: `AnimationOptions`

Property | Type | Required | Default&nbsp;value | Explanation
:------------- |:-------------: |:-------------:| :-------------:| :-------------
play | `boolean` | no | true | Start playing the animation right away
run | `number` | no | -1 | The number of times the animation should run, -1 = infinite
delay | `number` | no | 50 | Default delay for all frames that don't have a delay set
tempo | `number` | no | 1 | Timescale for all delays, double-speed = 2, half-speed = .5
reversed | `boolean` | no | false | Direction of the animation head, true == backwards
outOfViewStop | `boolean` | no | false | Stop animation if placeholder is no longer in view
script | `Array<Frame>` | no | all frames | New animation sequence
onPlay() | `function` | no |  | Callback called when animator starts playing
onStop() | `function` | no | null | Callback called when animator stops playing
onFrame() | `function` | no | null | Callback called when the new frame is rendered

The callbacks allow for interactions between sprites to take place. In the following example sprite1 will trigger play() on sprite2 after it's animation has been completed:

```js

const sprite1 = Spriteling({
  url: '/spritesheets/ping.png',
  cols: 3,
  rows: 9
}, '#sprite1')

const sprite2 = Spriteling({
  url: '/spritesheets/pong.png',
  cols: 3,
  rows: 9
}, '#sprite2')

sprite1.play({
  run: 3,
  script: [
    { sprite:1 },
    { sprite:2 },
    { sprite:3, delay:350},
    { sprite:4 }
  ],
  onStop: () => {
    sprite2.play()
  }
})
```

## .isPlaying()
Get the current play state

```js
const isPlaying = spriteling.isPlaying()
```

## .reverse()
Reverse direction of play

```js
spriteling.reverse()
```

## .isReversed()
Get the current direction of play

```js
const isReversed = spriteling.isReversed()
```

## .stop()
Stop the animation

```js
spriteling.stop()
```

## .reset()
Reset playhead to first frame

```js
spriteling.reset()
```


# Compatibility

Spriteling should work on almost anything. From IE7 to phones and tablets. Let me know if you find it doesn't work on a particular device and I'll see if I can fix that.


# License
The artwork in this repository has been created by [Arthur van 't Hoog](https://arthurvanthoog.nl) and is licensed under a [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/) license.

Meaning you are free to:

* Share — copy and redistribute the material in any medium or format

Under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NonCommercial — You may not use the material for commercial purposes.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.
