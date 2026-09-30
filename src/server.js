const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, config.host, () => {
  console.log(`${config.appName} (${config.nodeEnv}) listening on ${config.host}:${config.port}`);
});

// Graceful shutdown for docker stop
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, () => {
    console.log(`${sig} received, shutting down`);
    server.close(() => process.exit(0));
  })
);
