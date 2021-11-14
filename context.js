const url = require('url');
const fs = require('fs');
const mime = require('mime');
const _ = require('underscore')

module.exports = function context(req, res) {
  const urlObj = url.parse(req.url.toLowerCase(), true);

  req.query = urlObj.query;
  req.pathname = urlObj.pathname;
  req.method = req.method.toLowerCase();

  res.render = (filename, tplData) => {
    fs.readFile(filename, function (err, data) {
      if (err) {
        res.writeHead(404, 'Not Found', {
          'Content-Type': 'text/html; charset=utf-8'
        });
        res.end('404, Page Not Found')
      }
      if (tplData) {
        const fn = _.template(data.toString('utf8'));
        data = fn(tplData);
      }

      res.setHeader('Content-Type', mime.getType(filename));
      res.end(data);
    })
  }
}