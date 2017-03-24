'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Tree extends Array {}

function signal(){}

var constructorRegex = /^\s*class /;
function callable(fn) {
  if(constructorRegex.test(fn.toString())) {
    return function(a, b){
      return new fn(a, b);
    };
  }
  return fn;
}

var h = function(tag, attrs, children){
  const argsLen = arguments.length;
  if(argsLen === 2) {
    if(typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if(argsLen > 3 || (children instanceof Tree) ||
    typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if(isFn) {
    return callable(tag)(attrs || {}, children);
  }

  var tree = new Tree();
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];
      acc.push(key);
      acc.push(value);

      var eventInfo = signal(tag, key, value, attrs);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  tree.push(open);

  if(children) {
    children.forEach(function(child){
      if(typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while(child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);

  return tree;
};

//<script src="/service-worker-registration.js"></script>

const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';

var Layout = function (props, children) {
  let state = props.state;

  const scripts = !isNode ? '' : h(
    'div',
    null,
    h('script', { src: '/node_modules/fritz/window.js' }),
    h(
      'script',
      null,
      state ? `fritz.state = ${ JSON.stringify(state) };\n` : '',
      'fritz.app = new Worker(\'/routes.js\');'
    )
  );

  return h(
    'html',
    null,
    h(
      'head',
      null,
      h(
        'title',
        null,
        'Aliens app!'
      ),
      h('link', { rel: 'stylesheet', href: '/styles.css' }),
      h('link', { rel: 'manifest', href: '/manifest.json' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('link', { rel: 'preload', href: '/node_modules/fritz/window.js', as: 'script' }),
      h('link', { rel: 'preload', href: '/routes.js', as: 'worker' }),
      h('link', { rel: 'preload', href: '/service-worker-registration.js', as: 'script' }),
      h('link', { rel: 'shortcut icon', href: '/favicon.ico' })
    ),
    h(
      'body',
      null,
      h(
        'header',
        null,
        h(
          'a',
          { 'class': 'home-button', href: '/' },
          h(
            'svg',
            { 'class': 'home-icon', version: '1.0', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 300.000000 300.000000', preserveAspectRatio: 'xMidYMid meet' },
            h(
              'g',
              { transform: 'translate(0.000000,300.000000) scale(0.100000,-0.100000)', fill: '#210124', stroke: 'none' },
              h('path', { 'class': 'node', id: 'node1', d: 'M1419 2846 c-69 -55 -1374 -1367 -1398 -1406 -11 -19 -21 -45 -21 -58 0 -35 41 -91 78 -103 72 -24 54 -40 760 664 l662 662 663 -662 c707 -707 689 -691 759 -664 33 13 78 71 78 102 0 13 -9 39 -21 58 -22 36 -1359 1379 -1412 1418 -46 34 -94 31 -148 -11z' }),
              h('path', { 'class': 'node', id: 'node2', d: 'M923 1784 l-573 -574 0 -393 c1 -293 4 -401 14 -428 20 -56 61 -103 113 -129 46 -24 57 -25 297 -28 195 -3 250 -1 256 9 5 7 9 182 10 388 0 229 5 392 11 416 29 109 138 242 240 292 59 29 153 53 209 53 167 0 339 -110 416 -266 45 -91 54 -173 54 -519 -1 -143 0 -286 0 -318 l0 -59 253 4 252 3 55 31 c38 22 64 46 85 79 l30 48 3 409 3 408 -574 575 c-316 316 -576 575 -578 574 -2 0 -262 -259 -576 -575z' })
            ),
            h('g', { transform: 'translate(0.000000,300.000000) scale(0.100000,-0.100000)', fill: '#ADADAD', stroke: 'none' })
          )
        )
      ),
      h(
        'main',
        null,
        h(
          'section',
          null,
          children
        )
      ),
      h(
        'footer',
        null,
        h(
          'p',
          null,
          'Content courtesy of the ',
          h(
            'a',
            { href: 'http://avp.wikia.com/wiki/Main_Page' },
            'Xenopedia'
          ),
          ', and licensed under the ',
          h(
            'a',
            { href: 'http://www.wikia.com/Licensing' },
            'CC-BY-SA'
          ),
          '.'
        )
      ),
      scripts
    )
  );
};

var Loading = function () {
  return h(
    "div",
    { "class": "loading" },
    h(
      "svg",
      { version: "1.1", id: "Layer_1", xmlns: "http://www.w3.org/2000/svg", x: "0px", y: "0px", width: "24px", height: "30px", viewBox: "0 0 24 30", style: "enable-background:new 0 0 50 50;" },
      h(
        "rect",
        { x: "0", y: "0", width: "4", height: "10", fill: "#E5FCF5", transform: "translate(0 17.7778)" },
        h("animateTransform", { attributeType: "xml", attributeName: "transform", type: "translate", values: "0 0; 0 20; 0 0", begin: "0", dur: "0.6s", repeatCount: "indefinite" })
      ),
      h(
        "rect",
        { x: "10", y: "0", width: "4", height: "10", fill: "#E5FCF5", transform: "translate(0 4.44444)" },
        h("animateTransform", { attributeType: "xml", attributeName: "transform", type: "translate", values: "0 0; 0 20; 0 0", begin: "0.2s", dur: "0.6s", repeatCount: "indefinite" })
      ),
      h(
        "rect",
        { x: "20", y: "0", width: "4", height: "10", fill: "#E5FCF5", transform: "translate(0 8.88889)" },
        h("animateTransform", { attributeType: "xml", attributeName: "transform", type: "translate", values: "0 0; 0 20; 0 0", begin: "0.4s", dur: "0.6s", repeatCount: "indefinite" })
      )
    )
  );
};

function first(obj) {
  let key = Object.keys(obj)[0];
  return obj[key];
}

function thumbnail(item, width, height) {
  let tn = item.thumbnail || '';
  tn = tn.replace('http:', '');

  // TODO maybe do something with the width and height
  return tn;
}

function Specie({ specie }) {
  let url = `/article/${ specie.id }`;
  let tn = thumbnail(specie);

  return h(
    'li',
    { 'class': 'specie' },
    h(
      'a',
      { href: url },
      h(
        'figure',
        null,
        tn ? h('img', { src: tn }) : ''
      ),
      h(
        'span',
        { 'class': 'specie-title' },
        specie.title
      )
    )
  );
}

var SpeciesList = function ({ filter, species }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return h(
    'div',
    { 'data-url': '/select', 'data-event': 'keyup', 'data-method': 'POST', 'data-include': 'keyCode', 'data-no-push': true },
    h(
      'h1',
      null,
      'Aliens'
    ),
    h(
      'form',
      { action: '/search', 'data-event': 'keyup', 'data-no-push': true },
      h('input', { type: 'text', value: filter ? filter : '', name: 'q', placeholder: 'Search species', 'class': 'alien-search' })
    ),
    h(
      'ul',
      { 'class': 'species' },
      items.map(specie => {
        return h(Specie, { specie: specie });
      })
    )
  );
};

function filterSpecies(species, query) {
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) !== -1);
}

function article$1({ data }) {
  let intro = data.article.sections[0];
  let item = first(data.detail.items);

  return h(
    'div',
    { 'class': 'species-article' },
    h(
      'header',
      null,
      h(
        'h1',
        null,
        intro.title
      )
    ),
    h(
      'article',
      null,
      h(
        'figure',
        null,
        h('img', { src: thumbnail(item) })
      ),
      h(
        'div',
        null,
        data.article.sections.map(articleSection$1)
      )
    )
  );
}

function articleSection$1(section, idx) {
  return h(
    'section',
    null,
    idx === 0 ? '' : h(
      'h2',
      null,
      section.title
    ),
    h(
      'div',
      null,
      section.content.map(content => {
        switch (content.type) {
          case 'list':
            return list(content);
          default:
            return h(
              'p',
              null,
              content.text
            );
        }
      })
    )
  );
}

function list(content) {
  return h(
    'ul',
    null,
    content.elements.map(elem => {
      return h(
        'li',
        null,
        elem.text
      );
    })
  );
}

function index(species, state) {
  return h(
    Layout,
    { state: state },
    h(
      'aliens-click',
      null,
      h(SpeciesList, { species: species })
    )
  );
}

function search(species, query, state) {
  return h(
    Layout,
    { state: state },
    h(SpeciesList, { species: species, filter: query })
  );
}

function article(articleData, state) {
  return h(
    Layout,
    { state: state },
    h(article$1, { data: articleData })
  );
}

exports.Layout = Layout;
exports.Loading = Loading;
exports.SpeciesList = SpeciesList;
exports.index = index;
exports.search = search;
exports.article = article;
