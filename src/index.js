const braumeister = require('./braumeister');

module.exports = () => name => braumeister.search(name);
