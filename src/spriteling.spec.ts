import * as imageLoaded from 'image-loaded'
import Spriteling from './spriteling'

// Mock imageLoaded
imageLoaded.default = jest.fn((a, b) => {
  b()
})

describe('Constructor', () => {
  it('should return instance of Spriteling', () => {
    const instance = new Spriteling({ url: './some-image', cols: 10, rows: 10 })
    expect(instance instanceof Spriteling).toBe(true)
  })

  it('should wait for image to be loaded', () => {
    const instance = new Spriteling({ url: './some-image', cols: 10, rows: 10 })
    expect(imageLoaded.default).toBeCalled()
  })

  xit('should use DOMElement when provided', () => {})
  xit('should create new element when none is provided', () => {})
  xit('should try to lookup element when selector string provided', () => {})
  xit('should create new element when selector returns zero results', () => {})
  xit('should use background-image when no url has been provided', () => {})
  xit('should error when no spritesheet image is provided and background-image is not set', () => {})
  xit('should error when no cols/rows are provided', () => {})
  xit('should draw startSprite when provided', () => {})
  xit('should call onLoaded when provided', () => {})
})
