(function () {
'use strict';

var Messenger = class {
  constructor(app) {
    this.app = app;
    this._listen();
  }

  _listen() {
    self.addEventListener('message',
      e => this.handle(e));
  }

  handle(e) {
    let msg = e.data;

    switch(msg.type) {
      case 'render':
        this.app.render(msg);
        break;
      case 'event':
        this.app.handleEvent(msg);
        break;
    }
  }

  define(tag) {
    postMessage({ type: 'tag', tag });
  }

  dispatch(id, event) {
    let msg = { id, type: 'event', event };
    postMessage(msg);
  }

  send(id, response) {
    let msg = Object.assign({ id, type: 'render' }, response);
    postMessage(msg);
  }
};

var index$1 = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

var isarray = index$1;

/**
 * Expose `pathToRegexp`.
 */
var index = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

index.parse = parse_1;
index.compile = compile_1;
index.tokensToFunction = tokensToFunction_1;
index.tokensToRegExp = tokensToRegExp_1;

class App {
  constructor() {
    this.messenger = new Messenger(this);
    this.componentMap = new Map();
    this.idMap = new Map();
    this.instMap = new WeakMap();
  }

  define(tag, constr) {
    this.componentMap.set(tag, constr);
    this.messenger.define(tag);
  }

  handleEvent(msg) {
    let id = msg.id;
    let inst = this.idMap.get(id);
    let response$$1 = Object.create(null);
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    let method = inst[methodName];
    if(method) {
      method.call(inst);
      response$$1.tree = inst.render();
      this.messenger.send(id, response$$1);
    } else {
      // TODO warn?
    }
  }

  render(msg) {
    let id = msg.id;
    let tag = msg.tag;
    let inst = this.idMap.get(id);
    let response$$1 = Object.create(null);
    if(!inst) {
      let constr = this.componentMap.get(tag);
      inst = new constr();
      inst._app = this;
      this.idMap.set(id, inst);
      this.instMap.set(inst, id);
      response$$1.events = constr.observedEvents;
    }
    response$$1.tree = inst.render();
    this.messenger.send(id, response$$1);
  }

  update(inst) {
    let id = this.instMap.get(inst);
    let response$$1 = Object.create(null);
    response$$1.tree = inst.render();
    this.messenger.send(id, response$$1);
  }

  dispatch(inst, ev) {
    let id = this.instMap.get(inst);
    this.messenger.dispatch(id, ev);
  }
}

const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {

  if(eventAttrExp.test(attrName)) {
    return null;
  }

  switch(attrName) {
    case 'action':
      if(tagName === 'form') {
        let eventName = s.event(attrs) || 'submit';
        let method = s.method(attrs) || attrs['method'];
        return [1, 'on' + eventName, attrValue, method];
      }
      break;
    case 'href':
      if(tagName === 'a' && App.hasMatchingRoute('GET', attrValue)) {
        return [1, 'onclick', attrValue, 'GET'];
      }
      break;
    case 'data-url':
      let method = s.method(attrs) || 'GET';
      if(App.hasMatchingRoute(method, attrValue)) {
        let eventName = s.event(attrs) || 'click';
        return [1, 'on' + eventName, attrValue, method];
      }
      break;
  }
}

const s = ['event', 'url', 'method'].reduce(function(o, n){
  var prop = 'data-' + n;
  o[n] = function(attrs){
    return attrs[prop];
  };
  return o;
}, {});

var signal$1 = isNode ? function(){} : signal;

class Tree extends Array {}

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
    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];
      acc.push(key);
      acc.push(value);

      var eventInfo = signal$1(tag, key, value, attrs);
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

class Component {
  dispatch(ev) {
    this._app.dispatch(this, ev);
  }

  update() {
    this._app.update(this);
  }
}

const fritz = new App();

fritz.h = h;
fritz.Component = Component;

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

var styles = ".alien-search {\n  background: var(--alt-bg-color, #0B0014);\n  color: var(--fg-color, #F5E9E2);\n  border: none;\n  line-height: 1.5em;\n  padding: .5em;\n  outline: none;\n  font-size: 1.2em;\n  width: 100%;\n}\n\n.species {\n  list-style-type: none;\n  padding: 0;\n}\n\n.species figure {\n  display: flex;\n  justify-content: center;\n  margin: 0;\n  max-height: 200px;\n}\n\n.specie figure img {\n  border-radius: 5px;\n}\n\n@media only screen and (max-device-width: 767px) {\n  .specie figure img {\n    width: 150px;\n    height: 150px;\n  }\n}\n\nh1, h2, h3 {\n  color: var(--header-color);\n}\n\n.specie {\n  position: relative;\n  display: inline-flex;\n  margin: 10px;\n}\n\n.specie-title {\n  position: absolute;\n  background: rgba(0,0,0,.5);\n  color: var(--alt-link-color, white);\n  padding: 3px;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: center;\n}";

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

var SpeciesList = function ({ filter, species, keyup }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return h(
    'div',
    null,
    h(
      'style',
      null,
      styles
    ),
    h(
      'h1',
      null,
      'Aliens'
    ),
    h(
      'form',
      { action: '/search' },
      h('input', { onKeyup: keyup, type: 'text', value: filter ? filter : '',
        name: 'q', placeholder: 'Search species', 'class': 'alien-search' })
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

function list() {
  return fetch('/api/aliens').then(res => res.json());
}



function article(id) {
  return fetch(`/api/article/${ id }?width=300`).then(res => res.json());
}

class PageSelect extends Component {
  static get props() {
    return {
      page: { attribute: true },
      articleId: { attribute: true }
    };
  }

  render() {
    let page = this.page || 'index';

    if (page === 'index') {
      return h('index-page', null);
    }

    return h('article-page', { article: this.articleId });
  }
}

fritz.define('page-select', PageSelect);

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
        data.article.sections.map(articleSection)
      )
    )
  );
}

function articleSection(section, idx) {
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
            return list$1(content);
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

function list$1(content) {
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

var styles$1 = ".loading {\n  display: flex;\n  justify-content: center;\n}\n\n.loading svg {\n  height: 150px;\n  width: 150px;\n}\n\n.species-article header h1 {\n  font-size: 2.5em;\n}\n\n.species-article figure {\n  float: right;\n}\n\n.species-article p {\n  line-height: 23px;\n}";

class ArticlePage extends Component {
  static get props() {
    return {
      article: { attribute: true }
    };
  }

  constructor() {
    super();
    this.data = fritz.state;
    fritz.state = null;
  }

  get article() {
    return this._article;
  }

  set article(val) {
    this._article = Number(val);
  }

  loadArticle() {
    const id = this.article;
    if (isNaN(id)) {
      return;
    }

    article(id).then(data => {
      this.data = data;
      this.update();
    });
  }

  render() {
    if (!this.data) {
      this.loadArticle();
    }

    return h(
      'section',
      null,
      h(
        'style',
        null,
        styles$1
      ),
      this.data ? h(article$1, { data: this.data }) : h(Loading, null)
    );
  }
}

fritz.define('article-page', ArticlePage);

class IndexPage extends Component {
  constructor() {
    super();
    this.filter = '';
    this.species = [];

    if (fritz.state) {
      this.filter = fritz.state.filter;
      this.species = fritz.state.species;
      fritz.state = null;
    } else {
      list().then(species => {
        this.species = species;
        this.update();
      });
    }
  }

  keyup(ev) {
    this.filter = ev.value;
  }

  render() {
    return h(SpeciesList, { species: this.species, keyup: this.keyup,
      filter: this.filter });
  }
}

fritz.define('index-page', IndexPage);

}());
