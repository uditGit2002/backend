const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
  console.log(err.stack); // specific

  const status = res.statusCode ? res.statusCode : 500; // server error
  res.status(status);
  res.json({ message: err.message });
};
module.exports = errorHandler;
