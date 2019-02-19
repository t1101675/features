module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

handler.queryEntry = function(message, session, next) {
  let connectors = this.app.getServersByType('connector');
  let connectorServer = connectors[0];
  next(null, {
    code: 200,
    host: connectorServer.host,
    port: '3010'
  })
};
