const { Logger, Human, Filter, Transform } = require("caterpillar");
const { createWriteStream } = require("fs");
class AppendLines extends Transform {
  format(entry) {
    //makes sure that we have newlines for each entry
    return `${JSON.stringify(entry)} \n`;
  }
}

const logger = new Logger();

const initLogging = () => {
  const today = new Date().toISOString().slice(0, 13); //2021-10-01T15
  // Output human readable output to stdout in dev mode
  if (process.env.NODE_ENV !== "production") {
    logger.pipe(new Human()).pipe(process.stdout);
  }
  // Output all entries into a log file & human readable filtered logs to another log
  logger
    .pipe(new AppendLines())
    .pipe(createWriteStream("./verbose-" + today + ".log"));
  logger
    .pipe(new Filter({ filterLevel: 7 }))
    .pipe(new Human())
    .pipe(createWriteStream("./human-" + today + ".log"));
};

const exitHandler = (options, exitCode, type) => {
  logger.log(
    "App is recieved signal of type " + type + " with error code: " + exitCode
  );

  if (type === "SIGINT") {
    logger.log("App has recieved shutdown request by user");
  }
  if (options.exit) {
    logger.info("exiting after " + Math.floor(process.uptime()) + " Seconds..");
    logger.info("current resource usage: ", process.resourceUsage());
    setTimeout(() => process.exit(exitCode), 2000);
  }
};

const noOp = () => {
  // keeps process running even on err
  process.stdin.resume();
  // do something when app is closing - on app shutdown i.e. process.exit()
  process.on("exit", () => {
    logger.warn("server shutting down");
    exitHandler({ exit: true, logLevel: 5 }, 0);
  });
  // catches ctrl+c event
  process.on(
    "SIGINT",
    exitHandler.bind(null, { exit: true, logLevel: 5 }, 0, "SIGINT")
  );
  // catches uncaught exceptions
  process.on("uncaughtException", (err) => {
    logger.error(err);
    exitHandler({ exit: true, logLevel: 0 }, 1, "uncaughtException");
  });
  // catches unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    logger.error(err);
    exitHandler({ exit: true, logLevel: 0 }, 1, "UnhandledPromiseRejection");
  });
};

module.exports = {
  noOp,
  initLogging,
  logger,
};
