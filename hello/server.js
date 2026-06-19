const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<!DOCTYPE html><html><head><title>Hello World</title></head>' +
    '<body><h1>Hello, World!</h1><p>Served by Node.js</p></body></html>');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
