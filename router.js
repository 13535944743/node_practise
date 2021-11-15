const fs = require("fs");
const path = require("path");
const querystring = require('querystring');

const handler = require('./handler.js')

module.exports = (req, res) => {
  if (req.pathname === "/" || req.pathname === "/index" && req.method === "get") {
    handler.index(req, res);
  } else if (req.pathname === "/details" && req.method === "get") {
    handler.details(req, res);
  } else if (req.pathname === "/submit" && req.method === "get") {
    handler.submit(req, res);
  } else if (req.pathname === "/add" && req.method === "get") {
    handler.addGet(req, res);
  } else if (req.pathname === "/add" && req.method === "post") {
    handler.addPost(req, res);
  } else if (req.url.startsWith('/resources')) {
    handler.resource(req, res);
  } else {
    handler.notFound(req, res);
  }
}