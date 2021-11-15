const http = require("http");

const context = require('./context.js');
const router = require('./router.js');
const config = require('./config.js');

const serve = http.createServer((req, res) => {
  context(req, res);
  router(req, res);
}).listen(config.port, (err) => {
  console.log("http://localhost:" + config.port);
})