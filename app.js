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
        // 读data.json文件
        readNewsData((list) => {
          res.render(path.join(__dirname, 'views', 'index.html'), {
            list: list
          });
        })
      }
    })
  } else if (urlObj.pathname === "/details" && req.method === "get") {
    readNewsData((list) => {
      let model = null;
      for (let i = 0; i < list.length; i++) {
        if (list[i].id.toString() === urlObj.query.id) {
          model = list[i];
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
    readNewsData((list) => {
      urlObj.query.id = list.length + 1;
      list.push(urlObj.query);

      writeNewsData(JSON.stringify(list), () => {
        // 重定向
        res.statusCode = 302;
        res.statusMessage = 'Found';
        res.setHeader('Location', '/');
        res.end();
      })
    })
  } else if (req.url === "/add" && req.method === "post") {
    readNewsData((list) => {
      postNewsData(req, (postBody) => {
        postBody.id = (list.length + 1);
        list.push(postBody);

        writeNewsData(JSON.stringify(list), () => {
          res.statusCode = 302;
          res.statusMessage = 'Found';
          res.setHeader('Location', '/');
          res.end();
        })
      })
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


function readNewsData(callback) {
  fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
    let list = JSON.parse(data || '[]');
    callback(list);
  })
}

function writeNewsData(data, callback) {
  fs.writeFile(path.join(__dirname, 'data', 'data.json'), data, (err) => {
    if (err) {
      throw err;
    } else {
      callback();
    }
  })
}

function postNewsData(req, callback) {
  let arr = [];
  req.on('data', chunk => {
    arr.push(chunk);
  })
  req.on('end', () => {
    let postBody = Buffer.concat(arr);
    postBody = postBody.toString();
    postBody = querystring.parse(postBody);
    callback(postBody);
  })
}