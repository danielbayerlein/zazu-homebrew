const homebrew = require('./homebrew');

module.exports = () => name => homebrew.search(name);
