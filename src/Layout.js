import { h } from 'fritz';

const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';

export default function(props, children) {
  let state = props.state;

  const scripts = !isNode ? '' : (
    <div>
      <script src="/node_modules/fritz/window.js"></script>
      <script>
        {
          state ? `fritz.state = ${JSON.stringify(state)};\n` : ''
        }
        fritz.router = new Worker('/routes.js');
      </script>
    </div>
  );

  return <html>
    <head>
      <title>Aliens app!</title>
      <link rel="stylesheet" href="/styles.css"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="preload" href="/node_modules/fritz/window.js" as="script" />
      <link rel="preload" href="/routes.js" as="worker" />
    </head>
    <body>
      <header>
        <a class="home-button" href="/">
          <svg class="home-icon" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300.000000 300.000000" preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" fill="#210124" stroke="none">
              <path class="node" id="node1" d="M1419 2846 c-69 -55 -1374 -1367 -1398 -1406 -11 -19 -21 -45 -21 -58 0 -35 41 -91 78 -103 72 -24 54 -40 760 664 l662 662 663 -662 c707 -707 689 -691 759 -664 33 13 78 71 78 102 0 13 -9 39 -21 58 -22 36 -1359 1379 -1412 1418 -46 34 -94 31 -148 -11z"></path>
              <path class="node" id="node2" d="M923 1784 l-573 -574 0 -393 c1 -293 4 -401 14 -428 20 -56 61 -103 113 -129 46 -24 57 -25 297 -28 195 -3 250 -1 256 9 5 7 9 182 10 388 0 229 5 392 11 416 29 109 138 242 240 292 59 29 153 53 209 53 167 0 339 -110 416 -266 45 -91 54 -173 54 -519 -1 -143 0 -286 0 -318 l0 -59 253 4 252 3 55 31 c38 22 64 46 85 79 l30 48 3 409 3 408 -574 575 c-316 316 -576 575 -578 574 -2 0 -262 -259 -576 -575z"></path>
            </g>
            <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" fill="#ADADAD" stroke="none"></g>
          </svg>
        </a>
      </header>

      <main>
        <section>{children}</section>
      </main>
      <footer>
        <p>Content courtesy of the <a href="http://avp.wikia.com/wiki/Main_Page">Xenopedia</a>, and licensed under the <a href="http://www.wikia.com/Licensing">CC-BY-SA</a>.</p>
      </footer>
      {scripts}
    </body>
  </html>
};
