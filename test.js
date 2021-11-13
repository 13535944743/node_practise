const _ = require('underscore');

const html = '<h2><%= name %></h2>';

const f = _.template(html);

console.log(f({
  name: 'clz'
}));