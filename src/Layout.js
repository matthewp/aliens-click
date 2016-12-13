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
      <header></header>

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
