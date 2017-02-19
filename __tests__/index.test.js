const index = require('../src/');
const braumeister = require('../src/braumeister');

describe('index.js', () => {
  beforeEach(() => {
    braumeister.search = jest.fn();
    index()('vim');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('call braumeister.search with "vim"', () => {
    expect(braumeister.search).toBeCalledWith('vim');
  });
});
