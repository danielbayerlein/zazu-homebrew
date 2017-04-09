const index = require('../src/')
const homebrew = require('../src/homebrew')

describe('index.js', () => {
  beforeEach(() => {
    homebrew.search = jest.fn()
    index()('vim')
  })

  afterEach(() => jest.resetAllMocks())

  test('call homebrew.search with "vim"', () => {
    expect(homebrew.search).toBeCalledWith('vim')
  })
})
