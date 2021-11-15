const fs = require("fs");
const path = require("path");
const querystring = require('querystring');

const config = require('./config.js');

module.exports.index = (req, res) => {
  // 读data.json文件
  readNewsData((list) => {
    res.render(path.join(config.viewPath, 'index.html'), {
      list: list
    });
  })
};

module.exports.details = (req, res) => {
  readNewsData((list) => {
    let model = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id.toString() === req.query.id) {
        model = list[i];
        break;
      }
    }
    if (model) {
      res.render(path.join(config.viewPath, 'details.html'), {
        item: model
      })
    } else {
      res.render(path.join(config.viewPath, 'details.html'));
    }
  })
};

module.exports.submit = (req, res) => {
  res.render(path.join(config.viewPath, "submit.html"));
};

module.exports.addGet = (req, res) => {
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
};

module.exports.addPost = (req, res) => {
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
};

module.exports.resource = (req, res) => {
  res.render(path.join(__dirname, req.url));
};

module.exports.notFound = (req, res) => {
  res.writeHead(404, 'Not Found', {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end('404, Page Not Found');
}

function readNewsData(callback) {
  fs.readFile(config.dataPath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
    let list = JSON.parse(data || '[]');
    callback(list);
  })
}

function writeNewsData(data, callback) {
  fs.writeFile(config.dataPath, data, (err) => {
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