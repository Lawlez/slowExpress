const express = require("express");
const app = express();
const session = require('express-session')
const helmet = require('helmet')
const { initLogging, logger, noOp } = require("./exitHandler");

//starts the Logging service & exithandler
initLogging();
noOp();

const port = process.env.PORT || 8080;

try {
  app.use(helmet())
  app.set('trust proxy', 1)
  app.use(session({
    secret: 'slow dude :)',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))
  app.disable('x-powered-by')

  app.get("/", (req, res, next) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.removeHeader('X-Powered-By');
    res.removeHeader('x-powered-by');
    res.removeHeader('server');
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    logger.log(
      "CONN: ",
      "host and path: ",
      `${req.hostname}${req.url}`,
      "headers: ",
      req.rawHeaders.toString(),
      "IP addr: ",
      ip
    );
    //logger.log("FullInfo: ", req, next, req.headers.toString());
    sendAndSleep(res, 1);
  });

  app.listen(port, () => {
    logger.log(`slowExpress listening at http://localhost:${port}`);
  });
} catch (err) {
  logger.error(err);
}

const content =
  ' HTTP is a transfer protocol used by the World Wide Web to retrieve information from distributed servers. The HTTP model is extremely simple; the client establishes a connection to the remote server, then issues a request. The server then processes the request, returns a response, and closes the connection. \nThe request format for HTTP is quite simple. The first line specifies an object, together with the name of an object to apply the method to. The most commonly used method is "GET", which ask the server to send a copy of the object to the client. The client can also send a series of optional headers; these headers are in RFC-822 format. The most common headers are "Accept", which tells the server which object types the client can handle, and "User-Agent", which gives the implementation name of the client.\n The response format is also quite simple. Responses start with a status line indicating which version of HTTP the server is running, together with a result code and an optional message. This is followed by a series of optional object headers; the most important of these are "Content-Type", which describes the type of the object being returned, and "Content-Length", which indicates the length. The headers are teminated by an empty line. The server now sends any requested data. After the data have been sent, the server drops the connection. ';

const sendAndSleep = (response, counter) => {

    if (counter > content.length) {
      response.end();
    } else {
      response.write(content[counter]);
      counter++;
      setTimeout(() => {
        sendAndSleep(response, counter);
      }, 3000);
    }

};

