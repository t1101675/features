var pomelo = require('pomelo');

/**
 * Init app for client.
 */

var app;
if(global.MOCHA_TESTING) {
  let mockBase = process.cwd() + '/test';
  app = pomelo.createApp({base: mockBase});
} else {
  app = pomelo.createApp();
}
app.set('name', 'backend-demo');

var func = function() {
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.sioconnector,
      // 'websocket', 'polling-xhr', 'polling-jsonp', 'polling'
      transports : ['websocket', 'polling'],
      heartbeats : true,
      closeTimeout : 6 * 1000,
      heartbeatTimeout : 6 * 1000,
      heartbeatInterval : 1 * 1000,
      disconnectOnTimeout: true
    });
}

// app configuration
app.configure('production|development', 'connector', func);
app.configure('production|development', 'gate', func);
app.configure('production|development', 'game', func);

// start app
if(!global.MOCHA_TESTING) app.start();

if(!global.MOCHA_TESTING) {
  process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
  });
}
