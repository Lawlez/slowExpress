const express = require("express");
const app = express();
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(
  __dirname + "/node-" + Math.floor(Math.random() * 10000) + ".log",
  { flags: "w" }
);

const log_stdout = process.stdout;
const port = process.env.PORT || 8080;

try {
  app.get("/", (req, res, next) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.removeHeader('X-Powered-By');
    res.removeHeader('x-powered-by');
    res.removeHeader('server');
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(
      "CONN: ",
      "host and path: ",
      `${req.hostname}${req.url}`,
      "headers: ",
      req.rawHeaders.toString(),
      "IP addr: ",
      ip
    );
    console.log("FullInfo: ", req, next, req.headers.toString());
    sendAndSleep(res, 1);
  });

  app.listen(port, () => {
    console.log(`slowExpress listening at http://localhost:${port}`);
  });
} catch (err) {
  console.log(err);
}

const content =
  ' HTTP is a transfer protocol used by the World Wide Web to retrieve information from distributed servers. The HTTP model is extremely simple; the client establishes a connection to the remote server, then issues a request. The server then processes the request, returns a response, and closes the connection. \nThe request format for HTTP is quite simple. The first line specifies an object, together with the name of an object to apply the method to. The most commonly used method is "GET", which ask the server to send a copy of the object to the client. The client can also send a series of optional headers; these headers are in RFC-822 format. The most common headers are "Accept", which tells the server which object types the client can handle, and "User-Agent", which gives the implementation name of the client.\n The response format is also quite simple. Responses start with a status line indicating which version of HTTP the server is running, together with a result code and an optional message. This is followed by a series of optional object headers; the most important of these are "Content-Type", which describes the type of the object being returned, and "Content-Length", which indicates the length. The headers are teminated by an empty line. The server now sends any requested data. After the data have been sent, the server drops the connection. ';

const sendAndSleep = (response, counter) => {
  try {
    if (counter > content.length) {
      response.end();
    } else {
      response.write(content[counter]);
      counter++;
      setTimeout(() => {
        sendAndSleep(response, counter);
      }, 3000);
    }
  } catch (err) {
    console.log(err);
  }
};

console.log = function (d) {
  //console log to file
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};
