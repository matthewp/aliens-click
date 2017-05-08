const path = require('path');
const swPrecache = require('sw-precache');
const rootDir = path.join(__dirname, '/../public');

swPrecache.write(__dirname + '/../public/service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/app.js`,
    `${rootDir}/styles.css`,
    `${rootDir}/main.js`,
  ],
  stripPrefix: rootDir
});
