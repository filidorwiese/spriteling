import * as imageLoaded from 'image-loaded'
import Spriteling from '../spriteling'

jest.setTimeout(1000)

// Mock imageLoaded
imageLoaded.default = jest.fn((a, b) => {
  a.width = 100
  a.height = 100
  b()
})

describe('Playback', () => {
  let instance
  beforeEach(() => {
    instance = new Spriteling({url: './some-image.png', cols: 10, rows: 10})
  })

  describe('addScript', () => {
    it('should exist' ,() => {
      expect(typeof instance.addScript).toBe('function')
    })
  })
})
