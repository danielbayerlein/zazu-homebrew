/* eslint global-require: 0 */

describe('homebrew.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  describe('search', () => {
    let scrapeIt;
    let homebrew;
    let cache;

    beforeEach(() => {
      jest.mock('scrape-it');
      scrapeIt = require('scrape-it');

      jest.mock('cache-conf');
      cache = { get: jest.fn(), isExpired: jest.fn(), set: jest.fn() };
      require('cache-conf').mockImplementation(() => cache);

      homebrew = require('../src/homebrew');
    });

    test('returns an empty array', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        require('../__mocks__/result-empty.json'),
      )));

      return homebrew.search('abcdefghjkl')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(0);
        });
    });

    test('returns an array with formula', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        require('../__mocks__/result-formula.json'),
      )));

      return homebrew.search('yarn')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(1);

          expect(packages[0].id).toBe('zazu-homebrew.yarn');
          expect(packages[0].title).toBe('yarn');
          expect(packages[0].value).toBe('http://www.braumeister.org/formula/yarn');
          expect(packages[0].subtitle).toBe('Javascript package manager');
        });
    });

    test('returns an array with formulae', () => {
      scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
        require('../__mocks__/result-formulae.json'),
      )));

      return homebrew.search('vim')
        .then((packages) => {
          expect(packages).toBeInstanceOf(Array);
          expect(packages).toHaveLength(2);

          expect(packages[0].id).toBe('zazu-homebrew.vim');
          expect(packages[0].title).toBe('vim');
          expect(packages[0].value).toBe('http://www.braumeister.org/formula/vim');
          expect(packages[0].subtitle).toBe('Vi "workalike" with many additional features');

          expect(packages[1].id).toBe('zazu-homebrew.macvim');
          expect(packages[1].title).toBe('macvim');
          expect(packages[1].value).toBe('http://www.braumeister.org/formula/macvim');
          expect(packages[1].subtitle).toBe('GUI for vim, made for macOS');
        });
    });

    test('returns the expected error', () => {
      const body = 'Sorry, no formulae are matching your search.';

      scrapeIt.mockImplementation(() => new Promise((resolve, reject) => reject(body)));

      return homebrew.search('abcdefghijklmnopqrstuvwxyz')
        .catch((error) => {
          expect(error).toBe(body);
        });
    });

    describe('cache', () => {
      const mockResult = require('../__mocks__/result-formulae.json').formulae.map((obj) => {
        const formula = obj;
        formula.id = `zazu-homebrew.${formula.title}`;
        return formula;
      });

      beforeEach(() => {
        scrapeIt.mockImplementation(() => new Promise(resolve => resolve(
          require('../__mocks__/result-formulae.json'),
        )));
      });

      test('call cache.get with the expected arguments', () => (
        homebrew.search('vim')
          .then(() => {
            expect(cache.get).toBeCalledWith(
              'zazu-homebrew.vim',
              { ignoreMaxAge: true },
            );
          })
      ));

      test('call cache.set with the expected arguments', () => (
        homebrew.search('vim')
          .then(() => {
            expect(cache.set).toBeCalledWith(
              'zazu-homebrew.vim',
              mockResult,
              { maxAge: 3600000 },
            );
          })
      ));

      test('call cache.isExpired with the expected argument', () => {
        cache.get = jest.fn(() => mockResult);

        return homebrew.search('vim')
          .then(() => {
            expect(cache.isExpired).toBeCalledWith('zazu-homebrew.vim');
          });
      });

      test('returns the cache result', () => {
        cache.isExpired = jest.fn(() => false);
        cache.get = jest.fn(() => mockResult);

        return homebrew.search('vim')
          .then((packages) => {
            expect(packages).toEqual(mockResult);
          });
      });

      test('returns the cache result when an error occurs', () => {
        scrapeIt.mockImplementation(() => new Promise((resolve, reject) => reject()));

        cache.isExpired = jest.fn(() => true);
        cache.get = jest.fn(() => mockResult);

        return homebrew.search('vim')
          .then((packages) => {
            expect(packages).toEqual(mockResult);
          });
      });
    });
  });

  describe('integration', () => {
    jest.mock('cache-conf');

    const homebrew = require('../src/homebrew');
    const searchResult = homebrew.search('vim');

    test('returns an array', () => (
      searchResult.then((packages) => {
        expect(packages).toBeInstanceOf(Array);
      })
    ));

    test('returns an object with a id', () => (
      searchResult.then((packages) => {
        expect(packages[0].id).toBeDefined();
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
