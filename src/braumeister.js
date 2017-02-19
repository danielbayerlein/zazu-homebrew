const scrapeIt = require('scrape-it');

const URL = 'http://www.braumeister.org';
const SEARCH_URL = `${URL}/search`;
const FORMULA_URL = `${URL}/formula`;

module.exports.search = query => (
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
    // Formulae
    if (result.formulae.length) {
      return result.formulae;
    }

    // Formula
    if (result.title && result.value && result.subtitle) {
      const formula = result;
      delete formula.formulae;
      return [formula];
    }

    // No results
    return [];
  })
  .catch((error) => {
    console.error(error); // eslint-disable-line no-console
  })
);
