(function(){
  var waiting = [];
  var polys = Promise.resolve();

  if(typeof ShadowRoot !== 'function') {
    polys = load('/sd.js');
  }

  if(typeof customElements === 'undefined') {
    polys = polys.then(() => load('/ce.js'));
  }

  polys
  .then(function(){
    return load('/m.js', true);
  });

  function load(src, asModule = false) {
    var script = document.createElement('script');
    script.src = src;
    if(asModule) {
      script.type = 'module';
    }

    return new Promise(resolve => {
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
})();
