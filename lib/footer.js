
module.exports = function({ state = {} }){
  let jsonState = escape(JSON.stringify(state));

  return `
  <footer>
    <p>Content courtesy of the <a href="http://avp.wikia.com/wiki/Main_Page">Xenopedia</a>, and licensed under the <a href="http://www.wikia.com/Licensing">CC-BY-SA</a>.</p>
  </footer>
  
  <div id="state-from-server" data-state="${jsonState}"></div>
  <script src="/service-worker-registration.js" async></script>
  `;
};
