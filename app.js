const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require('mime');
const url = require('url');
const querystring = require('querystring');
const _ = require('underscore');

const serve = http.createServer((req, res) => {
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

  const urlObj = url.parse(req.url, true);


  req.url = req.url.toLowerCase();
  req.method = req.method.toLowerCase();

  if (req.url === "/" || req.url === "/index" && req.method === "get") {
    fs.readFile(path.join(__dirname, "views", "index.html"), (err, data) => {
      if (err) {
        throw err;
      } else {
        fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
          if (err && err.code !== 'ENOENT') {
            throw err;
          }
          let list_news = JSON.parse(data || '[]');
          res.render(path.join(__dirname, 'views', 'index.html'), {
            list: list_news
          });
        })
      }
    })
  } else if (urlObj.pathname === "/details" && req.method === "get") {
    fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }

      let list_news = JSON.parse(data || '[]');
      let model = null;
      for (let i = 0; i < list_news.length; i++) {
        if (list_news[i].id.toString() === urlObj.query.id) {
          model = list_news[i];
          break;
        }
      }
      if (model) {
        res.render(path.join(__dirname, 'views', 'details.html'), {
          item: model
        })
      } else {
        res.render(path.join(__dirname, 'views', 'details.html'));
      }
    })
  } else if (req.url === "/submit" && req.method === "get") {
    res.render(path.join(__dirname, "views", "submit.html"));
  } else if (req.url.startsWith("/add") && req.method === "get") {
    fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
        throw err;
      } else {
        let list = JSON.parse(data || '[]');
        list.push(urlObj.query);

        fs.writeFile(path.join(__dirname, 'data', 'data.json'), JSON.stringify(list), (err) => {
          if (err) {
            throw err;
          } else {
            // 重定向
            res.statusCode = 302;
            res.statusMessage = 'Found';
            res.setHeader('Location', '/');
            res.end();
          }
        })
      }
    })
  } else if (req.url === "/add" && req.method === "post") {
    fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
        throw err;
      } else {
        let list = JSON.parse(data || '[]');
        let arr = [];
        req.on('data', chunk => {
          arr.push(chunk);
        })
        req.on('end', () => {
          let postBody = Buffer.concat(arr);
          postBody = postBody.toString();
          postBody = querystring.parse(postBody);
          postBody.id = (list.length + 1);

          list.push(postBody);

          fs.writeFile(path.join(__dirname, 'data', 'data.json'), JSON.stringify(list), (err) => {
            if (err) {
              throw err;
            } else {
              res.statusCode = 302;
              res.statusMessage = 'Found';
              res.setHeader('Location', '/');
              res.end();
            }
          })

        })
      }
    })


  } else if (req.url.startsWith('/resources')) {
    res.render(path.join(__dirname, req.url));
  } else {
    res.writeHead(404, 'Not Found', {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('404, Page Not Found')
  }
}).listen(8080, (err) => {
  console.log("http://localhost:8080/");
})