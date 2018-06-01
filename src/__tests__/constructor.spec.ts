import * as imageLoaded from 'image-loaded'
import Spriteling from '../spriteling'

jest.setTimeout(1000)

// Mock imageLoaded
imageLoaded.default = jest.fn((a, b) => {
  a.width = 100
  a.height = 100
  b()
})

describe('Constructor', () => {
  beforeEach(() => {
    console.info = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    document.body.innerHTML = '<body></body>'
  })

  it('should return instance of Spriteling', () => {
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10})
    expect(instance instanceof Spriteling).toBe(true)
  })

  it('should wait for image to be loaded', () => {
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10})
    expect(imageLoaded.default).toBeCalled()
  })

  it('should use DOMElement when provided', () => {
    const element = document.createElement('div')
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10}, element)
    expect(element.style.backgroundImage).toEqual('url(./some-image.png)')
  })

  it('should create new element when none is provided', () => {
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10})
    const element = document.querySelector('.spriteling')
    expect(element).toMatchSnapshot()
  })

  it('should try to lookup element when selector string provided', () => {
    document.body.innerHTML = '<body><div id="sprite"></div></body>'
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10}, '#sprite')
    const element = document.querySelector('#sprite')
    expect(element.style.backgroundImage).toBe('url(./some-image.png)')
  })

  it('should create new element when selector returns zero results', () => {
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10}, '#doesntexist')
    const element = document.querySelector('.spriteling')
    expect(element).toMatchSnapshot()
  })

  it('should use background-image when no url has been provided', () => {
    document.body.innerHTML = '<body><div id="sprite" style="background: url(./another-image.png)"></div></body>'
    const instance = new Spriteling({cols: 5, rows: 10}, '#sprite')
    const element = document.querySelector('#sprite')
    expect(element.style.backgroundImage).toBe('url(./another-image.png)')
  })

  it('should error when no spritesheet image is provided and background-image is not set', () => {
    const instance = new Spriteling({cols: 5, rows: 10}, '', true)
    expect(console.error).toHaveBeenCalledWith('Spriteling', 'no spritesheet image found, please specify it with options.url or set as css background')
  })

  it('should error when no cols/rows are provided', () => {
    const instance = new Spriteling({url: './some-image.png', cols: 5}, '', true)
    expect(console.error).toHaveBeenCalledWith('Spriteling', 'options.rows not set')
    const instance = new Spriteling({url: './some-image.png', rows: 10}, '', true)
    expect(console.error).toHaveBeenCalledWith('Spriteling', 'options.cols not set')
  })

  it('should set positioning when provided', () => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 5,
      rows: 10,
      top: 1,
      right: 2,
      bottom: 3,
      left: 4
    })
    const element = document.querySelector('.spriteling')
    expect(element.style.top).toBe('1px')
    expect(element.style.right).toBe('2px')
    expect(element.style.bottom).toBe('3px')
    expect(element.style.left).toBe('4px')
  })

  it('should draw startSprite when provided', (done) => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 5,
      rows: 10,
      startSprite: 7,
      onLoaded: () => {
        const element = document.querySelector('div')
        expect(element.style.backgroundPosition).toBe('-20px -10px')
        done()
      }
    })
  })

  it('should call onLoaded when provided', (done) => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 5,
      rows: 10,
      onLoaded: done
    })
  })

  it('should complain when spritesheet is not dividable by specified rows/cols', (done) => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 11,
      rows: 12,
      onLoaded: () => {
        expect(console.error).toHaveBeenCalledWith('Spriteling', 'frameWidth 9.090909090909092 is not a whole number')
        expect(console.error).toHaveBeenCalledWith('Spriteling', 'frameHeight 8.333333333333334 is not a whole number')
        done()
      }
    })
  })

  it('should correctly apply cutOffFrames', () => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 5,
      rows: 10,
      cutOffFrames: 5
    })
    expect(instance.spriteSheet.totalSprites).toEqual(45)
  })

  it('should created "all" animation script', () => {
    const instance = new Spriteling({
      url: './some-image.png',
      cols: 5,
      rows: 10
    })
    expect(instance.spriteSheet.animations['all'].length).toEqual(50)
  })
})

describe('Destructor', () => {
  it('should be destroyable', () => {
    document.body.innerHTML = '<body><div id="sprite"></div></body>'
    const instance = new Spriteling({url: './some-image.png', cols: 5, rows: 10}, '#sprite')
    instance.destroy()
    const element = document.querySelector('#sprite')
    expect(element).toBeNull()
  })
})
