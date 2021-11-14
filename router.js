const fs = require("fs");
const path = require("path");
const querystring = require('querystring');

module.exports = (req, res) => {
  if (req.pathname === "/" || req.pathname === "/index" && req.method === "get") {

    // 读data.json文件
    readNewsData((list) => {
      res.render(path.join(__dirname, 'views', 'index.html'), {
        list: list
      });
    })
  } else if (req.pathname === "/details" && req.method === "get") {
    readNewsData((list) => {
      let model = null;
      for (let i = 0; i < list.length; i++) {
        if (list[i].id.toString() === req.query.id) {
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
  } else if (req.pathname === "/submit" && req.method === "get") {
    res.render(path.join(__dirname, "views", "submit.html"));
  } else if (req.path == "/add" && req.method === "get") {
    readNewsData((list) => {
      req.query.id = list.length + 1;
      list.push(req.query);

      writeNewsData(JSON.stringify(list), () => {
        // 重定向
        res.statusCode = 302;
        res.statusMessage = 'Found';
        res.setHeader('Location', '/');
        res.end();
      })
    })
  } else if (req.pathname === "/add" && req.method === "post") {
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
}


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