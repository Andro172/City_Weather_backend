const debug = require('debug')('server:');
const server = require('./app');
require('./services/CRON.service');

const port = 3000;

server.listen(port, () => {
  debug('listening on port', port);
});
