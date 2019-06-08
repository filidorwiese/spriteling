import * as imageLoaded from 'image-loaded'
import * as raf from 'raf'
import Spriteling from '../spriteling'

jest.setTimeout(1000)

// Mock imageLoaded
imageLoaded.default = jest.fn((a, b) => {
  a.width = 100
  a.height = 100
  b()
})

// Mock dummy RAF
raf.default = jest.fn()
raf.default.cancel = jest.fn()

// Mock RAF to play x amount of frames
let workingRafTimeout
const workingRaf = (framesToRender: number, delay: number) => {
  let time = 0
  return (a) => {
    if (framesToRender) {
      framesToRender--
      workingRafTimeout = setTimeout(() => {
        a(time += delay)
      }, delay)
    }
  }
}

// Mock element.offsetParent property
Object.defineProperties((window as any).HTMLElement.prototype, {
  offsetParent: {
    get: () => 0
  }
})

// Example animation script
const myScriptName = 'my-script'
const myAnimationScript = [
  {sprite: 2},
  {sprite: 3, delay: 100},
  {sprite: 7, top: 1},
  {sprite: 1, right: 2},
  {sprite: 5, bottom: 3},
  {sprite: 6, left: 4}
]

describe('Playback', () => {
  let instance
  beforeEach(() => {
    instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10})
  })

  describe('showSprite()', () => {
    it('should wait for loading promise to be fullfilled', async () => {
      instance.drawFrame = jest.fn()
      const r = instance.showSprite(2)
      await r
      expect(r instanceof Promise).toBe(true)
      expect(instance.drawFrame.mock.calls.length).toBe(1)
    })

    it('should set playhead to stop', async () => {
      instance.playhead.play = true
      await instance.showSprite(2)
      expect(instance.isPlaying()).toBe(false)
    })

    it('should show the specified sprite', async () => {
      await instance.showSprite(7)
      expect(instance.element.style.backgroundPosition).toBe('-20px -10px')
      await instance.showSprite(13)
      expect(instance.element.style.backgroundPosition).toBe('-40px -20px')
    })

    it('should warn when the specified sprite is out of bounds', async () => {
      console.warn = jest.fn()
      await instance.showSprite(70)
      expect(console.warn).toHaveBeenCalledWith('Spriteling', 'position 70 out of bound')
    })
  })

  describe('currentSprite()', () => {
    it('should return the current sprite', async () => {
      await instance.showSprite(7)
      const r = await instance.currentSprite(7)
      expect(r).toBe(7)
    })
  })

  describe('addScript', () => {
    it('should store named animation script', () => {
      instance.addScript(myScriptName, myAnimationScript)
      expect(instance.spriteSheet.animations[myScriptName]).toEqual(myAnimationScript)
    })
  })

  describe('play()', () => {
    beforeEach(() => {
      instance.addScript(myScriptName, myAnimationScript)
    })

    it('should play indefinite when called without parameters', async () => {
      await instance.play()
      expect(instance.playhead.play).toBe(true)
      expect(instance.playhead.run).toBe(-1)
    })

    it('should play once when called without parameters after animation has stopped', async () => {
      instance.playhead.play = false
      instance.playhead.run = 0
      await instance.play()
      expect(instance.playhead.play).toBe(true)
      expect(instance.playhead.run).toBe(1)
    })

    it('should play script when called with scriptName', async () => {
      await instance.play(myScriptName)
      expect(instance.playhead.script).toBe(myAnimationScript)
      expect(instance.playhead.play).toBe(true)
      expect(instance.playhead.run).toBe(-1)
    })

    it('should play script + options when called with scriptName + options', async () => {
      await instance.play(myScriptName, {
        run: 2,
        delay: 3,
        tempo: 4,
        reversed: true
      })
      expect(instance.playhead).toMatchSnapshot()
    })

    it('should play "all" animation when scriptName is not found', async () => {
      await instance.play('unknown script', {
        run: 2
      })
      expect(instance.playhead.script.length).toBe(50)
    })

    it('should play current + options when called with options', async () => {
      await instance.play(myScriptName, {})
      await instance.play({
        run: 20,
        delay: 3,
        tempo: 4
      })
      expect(instance.playhead).toMatchSnapshot()
    })

    it('should play script + options when called with options and embedded new script', async () => {
      const embeddedScript = [
        {sprite: 4},
        {sprite: 3}
      ]
      await instance.play({
        run: 1,
        reversed: true,
        script: embeddedScript
      })
      expect(instance.playhead.script).toEqual(embeddedScript)
    })

    it('should call onPlay when provided', async (done) => {
      await instance.play(myScriptName, {
        run: 1,
        onPlay: done
      })
    })

    it('should call onStop when provided and stop() is called', async (done) => {
      await instance.play(myScriptName, {
        run: 1,
        onStop: done
      })
      instance.stop()
    })

    it('should call onFrame when provided', async (done) => {
      await instance.play(myScriptName, {
        run: 1,
        onFrame: (currentFrame) => {
          expect(currentFrame).toBe(0)
          done()
        }
      })
    })

    it('should call onOutOfView when provided and element is no longer in view', async (done) => {
      // Fake out-of-view
      instance.inViewport = jest.fn(() => false)
      await instance.play({
        run: 1,
        onOutOfView: done
      })
    })

    it('should apply positioning per frame', async (done) => {
      await instance.play({
        run: 1,
        script: [
          {sprite: 4, top: 10, right: 20, bottom: 30, left: 40},
          {sprite: 3, top: 10, right: 20, bottom: 30, left: 40},
          {sprite: 2, top: 10, right: 20, bottom: 30, left: 40},
          {sprite: 1, top: 10, right: 20, bottom: 30, left: 40}
        ]
      })

      await instance.next()
      expect(instance.element.style.top).toBe('10px')
      expect(instance.element.style.right).toBe('20px')
      expect(instance.element.style.bottom).toBe('30px')
      expect(instance.element.style.left).toBe('40px')
      done()
    })

    it('should play script forwards', async (done) => {
      const delay = 10
      const simpleScript = [
        {sprite: 1},
        {sprite: 2},
        {sprite: 3},
        {sprite: 4}
      ]
      let counter = 0

      raf.default.mockImplementation(workingRaf(4, delay))

      await instance.play({
        run: 1,
        delay,
        script: simpleScript,
        onFrame: (frameNumber) => {
          expect(frameNumber).toBe(counter)
          counter++
        },
        onStop: () => {
          clearTimeout(workingRafTimeout)
          done()
        }
      })
    })

    it('should play script reversed', async (done) => {
      const delay = 10
      const simpleScript = [
        {sprite: 1},
        {sprite: 2},
        {sprite: 3},
        {sprite: 4}
      ]
      let counter = 3

      raf.default.mockImplementation(workingRaf(4, delay))

      await instance.play({
        run: 1,
        delay,
        script: simpleScript,
        reversed: true,
        onFrame: (frameNumber) => {
          expect(frameNumber).toBe(counter)
          counter--
        },
        onStop: () => {
          clearTimeout(workingRafTimeout)
          done()
        }
      })
    })

    it('should stop when run reached 0', async (done) => {
      const delay = 10
      const simpleScript = [
        {sprite: 1},
        {sprite: 2},
        {sprite: 3},
        {sprite: 4}
      ]

      raf.default.mockImplementation(workingRaf(5, delay))

      await instance.play({
        run: 1,
        delay,
        script: simpleScript,
        reversed: true,
        onStop: () => {
          setTimeout(() => {
            clearTimeout(workingRafTimeout)
            expect(raf.default.cancel).toHaveBeenCalled()
            done()
          }, 100)
        }
      })
    })

    it('should set nextDelay', async (done) => {
      const delay = 40
      const simpleScript = [
        {sprite: 1, delay: 10},
        {sprite: 2, delay: 20},
        {sprite: 3, delay: 30},
        {sprite: 4, delay: 40}
      ]

      raf.default.mockImplementation(workingRaf(4, delay))

      await instance.play({
        run: 1,
        delay,
        script: simpleScript,
        onFrame: (c) => {
          expect(instance.playhead.nextDelay).toBe(simpleScript[c].delay)
        },
        onStop: () => {
          clearTimeout(workingRafTimeout)
          done()
        }
      })
    })

    it('should set nextDelay based on tempo', async (done) => {
      const delay = 40
      const tempo = 2
      const simpleScript = [
        {sprite: 1, delay: 10},
        {sprite: 2, delay: 20},
        {sprite: 3, delay: 30},
        {sprite: 4, delay: 40}
      ]

      raf.default.mockImplementation(workingRaf(4, delay))

      await instance.play({
        run: 1,
        delay,
        script: simpleScript,
        tempo,
        onFrame: (c) => {
          expect(instance.playhead.nextDelay).toBe(simpleScript[c].delay / tempo)
        },
        onStop: () => {
          clearTimeout(workingRafTimeout)
          done()
        }
      })
    })
  })

  describe('isPlaying()', () => {
    it('should return the playing state', () => {
      instance.playhead.play = false
      expect(instance.isPlaying()).toBe(false)
      instance.playhead.play = true
      expect(instance.isPlaying()).toBe(true)
    })

  })

  describe('setTempo()', () => {
    it('should set the tempo', async () => {
      instance.playhead.tempo = 1
      await instance.setTempo(2)
      expect(instance.playhead.tempo).toBe(2)
    })
  })

  describe('getTempo()', () => {
    it('should get the tempo', () => {
      instance.playhead.tempo = .5
      expect(instance.getTempo()).toBe(.5)
    })
  })

  describe('next()', () => {
    it('should draw next frame', async () => {
      const simpleScript = [
        {sprite: 1, delay: 10},
        {sprite: 2, delay: 20},
        {sprite: 3, delay: 30},
        {sprite: 4, delay: 40}
      ]

      instance.drawFrame = jest.fn()
      await instance.play({
        play: false,
        run: 1,
        script: simpleScript
      })

      await instance.next()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 10, sprite: 1})
      await instance.next()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 20, sprite: 2})
      await instance.next()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 30, sprite: 3})
      await instance.next()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 40, sprite: 4})
      await instance.next()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 10, sprite: 1})
    })
  })

  describe('previous()', () => {
    it('should draw previous frame', async () => {
      const simpleScript = [
        {sprite: 1, delay: 10},
        {sprite: 2, delay: 20},
        {sprite: 3, delay: 30},
        {sprite: 4, delay: 40}
      ]
      instance.drawFrame = jest.fn()
      await instance.play({
        play: false,
        run: 1,
        script: simpleScript
      })

      await instance.previous()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 40, sprite: 4})
      await instance.previous()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 30, sprite: 3})
      await instance.previous()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 20, sprite: 2})
      await instance.previous()
      expect(instance.drawFrame).toHaveBeenCalledWith({delay: 10, sprite: 1})
    })
  })

  // TODO
  // xdescribe('goTo()', () => {
  //   it('should', () => {
  //   })
  // })
  //
  // xdescribe('reverse()', () => {
  //   it('should', () => {
  //   })
  // })
  //
  // xdescribe('isReversed()', () => {
  //   it('should', () => {
  //   })
  // })
  //
  // xdescribe('stop()', () => {
  //   it('should', () => {
  //   })
  // })
  //
  // xdescribe('reset()', () => {
  //   it('should', () => {
  //   })
  // })
})
