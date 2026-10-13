// ==========================================================================
// R & A ASSOCIATES HRMS - SERVER ENTRY POINT
// ==========================================================================

const http = require('http');
const config = require('./src/config');
const { createAppHandler } = require('./src/app');

const appHandler = createAppHandler();
const server = http.createServer(appHandler);

const isMain = require.main === module || (require.main && typeof require.main.filename === 'string' && /server\.js$/i.test(require.main.filename));

if (isMain && !process.env.VERCEL && !process.env.VERCEL_ENV) {
  server.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  R & A Associates HRMS Server Running`);
    console.log(`  URL: http://localhost:${config.PORT}`);
    console.log(`  Data storage: ${config.DB_FILE}`);
    console.log(`=======================================================`);
  });
}

module.exports = server;
module.exports.handler = appHandler;
module.exports.app = appHandler;

