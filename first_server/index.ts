import * as http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, ho! \n");
  // have to use .end() to indicate that the response is ended
});

server.listen(5000);
