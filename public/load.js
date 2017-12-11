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
    return load('/m.js');
  });

  function load(src) {
    var script = document.createElement('script');
    script.src = src;

    return new Promise(resolve => {
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
})();
