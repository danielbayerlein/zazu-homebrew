const scrapeIt = require('scrape-it');
const CacheConf = require('cache-conf');

const URL = 'http://www.braumeister.org';
const SEARCH_URL = `${URL}/search`;
const FORMULA_URL = `${URL}/formula`;

const CACHE_CONF = {
  key: 'zazu-homebrew', // cache key prefix
  maxAge: 3600000, // 1 hour
};

const cache = new CacheConf();

/**
 * Scrape the URL, cache the result and return it.
 * Returns the cache result if it is valid.
 *
 * @param  {string}  query Search query
 * @return {Promise}       Returns a promise that is fulfilled with the JSON result
 */
module.exports.search = (query) => {
  const cacheKey = `${CACHE_CONF.key}.${query}`;
  const cachedResponse = cache.get(cacheKey, { ignoreMaxAge: true });

  if (cachedResponse && !cache.isExpired(cacheKey)) {
    return Promise.resolve(cachedResponse);
  }

  return new Promise((resolve, reject) => (
    scrapeIt(`${SEARCH_URL}/${query}`, {
      formulae: {
        listItem: '.listing > .formula',
        data: {
          title: '.formula',
          value: {
            selector: 'a.formula',
            attr: 'href',
            convert: path => `${URL}${path}`,
          },
          subtitle: {
            how: 'html',
            convert: html => html.match(/<br>(.*)<br>/)[1],
          },
        },
      },
      title: 'h1',
      value: {
        selector: 'h1',
        convert: name => `${FORMULA_URL}/${name}`,
      },
      subtitle: '#description',
    })
    .then((result) => {
      let data = [];

      // Formulae
      if (result.formulae.length) {
        data = result.formulae.map((obj) => {
          const formula = obj;
          formula.id = `${CACHE_CONF.key}.${formula.title}`;
          return formula;
        });
      }

      // Formula
      if (result.title && result.value && result.subtitle) {
        const formula = result;
        delete formula.formulae;
        formula.id = `${CACHE_CONF.key}.${formula.title}`;
        data = [formula];
      }

      // Cache the result if it is available
      if (data.length) {
        cache.set(cacheKey, data, { maxAge: CACHE_CONF.maxAge });
      }

      resolve(data);
    })
    .catch((error) => {
      if (cachedResponse) {
        resolve(cachedResponse);
      }

      reject(error);
    })
  ));
};
