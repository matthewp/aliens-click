const path = require('path');
const swPrecache = require('sw-precache');
const rootDir = path.join(__dirname, '/..');

swPrecache.write(__dirname + '/../service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/routes.js`,
    `${rootDir}/styles.css`,
    `${rootDir}/node_modules/fritz/window.js`,
  ],
  stripPrefix: rootDir
});
