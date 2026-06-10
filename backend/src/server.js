'use strict';

const app = require('./app');
const config = require('./config/config');

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend DDS escuchando en http://localhost:${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`   API base: http://localhost:${config.port}/api`);
  // eslint-disable-next-line no-console
  console.log(`   CORS origin: ${config.corsOrigin}`);
});
