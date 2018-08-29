const api = require('aliens-app/lib/api.js');
const footer = require('aliens-app/lib/footer.js');
const header = require('aliens-app/lib/header.js');
const speciesList = require('aliens-app/lib/species-list.js');
const styles = require('aliens-app/lib/species-list-styles.js');
const thumbnail = require('aliens-app/lib/thumbnail.js');

exports.handle = function(e, ctx, cb) {
  api.list().then(species => {
    species.forEach(specie => {
      specie.tn = thumbnail(specie);
    });

    let html = template({
      species, styles
    });

    cb(null, {
      isBase64Encoded: false,
      statusCode: 200,
      body: html,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'content-length': Buffer.byteLength(html)
      }
    });
  })
  .catch(err => {
    cb(err);
  });
};

function template(data) {
  return `
    <!doctype html>
    <html lang="en">
    <title>Aliens app!</title>
    <link rel="stylesheet" href="/assets/styles.css"/>
    <link rel="manifest" href="/assets/manifest.json"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="preload" href="/assets/main.js" as="script" />
    <link rel="preload" href="/assets/app.js" as="worker" />
    <link rel="preload" href="/assets/service-worker-registration.js" as="script" />
    <script src="/assets/load.js" defer></script>
    <link rel="shortcut icon" href="/assets/favicon.ico"/>

    ${header()}
    <main>
      <page-select page="index">
        <swap-shadow>
          <index-page>
            <swap-shadow>
              ${speciesList(data)}
            </swap-shadow>
          </index-page>
        </swap-shadow>
      </page-select>
    </main>
    ${footer({ state: Object.assign({}, data, {
      styles: ''
    })})}
  `;
}
