describe('braumeister.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  describe('search', () => {
    let scrapeIt;
    let braumeister;

    beforeEach(() => {
      jest.mock('scrape-it');

      // eslint-disable-next-line global-require
      scrapeIt = require('scrape-it');

      // eslint-disable-next-line global-require
      braumeister = require('../src/braumeister');

      // eslint-disable-next-line no-console
      console.error = jest.fn();
    });

    test('returns an empty array', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        // eslint-disable-next-line global-require
        require('../__mocks__/result-empty.json'),
      )));

      return braumeister.search('abcdefghjkl')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(0);
        });
    });

    test('returns an array with formula', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        // eslint-disable-next-line global-require
        require('../__mocks__/result-formula.json'),
      )));

      return braumeister.search('yarn')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(1);

          expect(packages[0].title).toBe('yarn');
          expect(packages[0].value).toBe('http://www.braumeister.org/formula/yarn');
          expect(packages[0].subtitle).toBe('Javascript package manager');
        });
    });

    test('returns an array with formulae', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        // eslint-disable-next-line global-require
        require('../__mocks__/result-formulae.json'),
      )));

      return braumeister.search('vim')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(2);

          expect(packages[0].title).toBe('vim');
          expect(packages[0].value).toBe('http://www.braumeister.org/formula/vim');
          expect(packages[0].subtitle).toBe('Vi "workalike" with many additional features');

          expect(packages[1].title).toBe('macvim');
          expect(packages[1].value).toBe('http://www.braumeister.org/formula/macvim');
          expect(packages[1].subtitle).toBe('GUI for vim, made for macOS');
        });
    });

    test('call console.error with an error message', () => {
      const body = 'Sorry, no formulae are matching your search.';

      scrapeIt.mockImplementation(() => new Promise((resolve, reject) => reject(body)));

      return braumeister.search('abcdefghjkl')
        .catch(() => {
          // eslint-disable-next-line no-console
          expect(console.error).toHaveBeenCalledWith(body);
        });
    });
  });

  describe('integration', () => {
    // eslint-disable-next-line global-require
    const braumeister = require('../src/braumeister');
    const searchResult = braumeister.search('vim');

    test('returns an array', () => (
      searchResult.then((packages) => {
        expect(packages).toBeInstanceOf(Array);
      })
    ));

    test('returns an object with a title', () => (
      searchResult.then((packages) => {
        expect(packages[0].title).toBeDefined();
      })
    ));

    test('returns an object with a value', () => (
      searchResult.then((packages) => {
        expect(packages[0].value).toBeDefined();
      })
    ));

    test('returns an object with a subtitle', () => (
      searchResult.then((packages) => {
        expect(packages[0].subtitle).toBeDefined();
      })
    ));
  });
});
