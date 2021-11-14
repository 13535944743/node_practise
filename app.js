const http = require("http");

const context = require('./context.js');
const router = require('./router.js');

const serve = http.createServer((req, res) => {
  context(req, res);
  router(req, res);
}).listen(8080, (err) => {
  console.log("http://localhost:8080/");
})