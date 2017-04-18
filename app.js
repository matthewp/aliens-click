(function () {
'use strict';

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';

class Component {
  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  update() {
    let id = this._fritzId;
    postMessage({
      type: RENDER,
      id: id,
      tree: this.render()
    });
  }
}

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
  }

  from(fn) {
    let handle;
    let id = this.handleMap.get(fn);
    if(id == null) {
      id = this.id++;
      handle = new Handle(id, fn);
      this.handleMap.set(fn, id);
      this.idMap.set(id, handle);
    } else {
      handle = this.idMap.get(id);
    }
    return handle;
  }

  get(id) {
    return this.idMap.get(id);
  }
};

Handle = class {
  static get store() {
    if(!this._store) {
      this._store = new Store();
    }
    return this._store;
  }

  static from(fn) {
    return this.store.from(fn);
  }

  static get(id) {
    return this.store.get(id);
  }

  constructor(id, fn) {
    this.id = id;
    this.fn = fn;
  }
};

var Handle$1 = Handle;

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if(eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let id = Handle$1.from(attrValue).id;
    return [1, eventName, id];
  }
}

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

      var eventInfo = signal(tag, key, value, attrs);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
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

class Serializable {
  serialize() {
    let out = Object.create(null);
    return Object.assign(out, this);
  }
}

class Event extends Serializable {
  constructor(type) {
    super();
    this.type = type;
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

function getInstance(fritz, id){
  return fritz._instances[id];
}

function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
}

function render(fritz, msg) {
  let id = msg.id;
  let instance = getInstance(fritz, id);
  let events;
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperty(instance, '_fritzId', {
      enumerable: false,
      value: id
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }
  let tree = instance.render();
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
}

function trigger(fritz, msg){
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if(msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if(method) {
    let event = new Event(msg.name);

    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = inst.render();
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
}

let hasListened = false;

function relay(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
      }
    });
  }
}

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  fritz._tags[tag] = constructor;

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag
  });
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

var SpeciesList = function ({ filter, species }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return h(
    'div',
    { 'data-url': '/select', 'data-event': 'keyup', 'data-method': 'POST', 'data-include': 'keyCode', 'data-no-push': true },
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

function list() {
  return fetch('/api/aliens').then(res => res.json());
}

class IndexPage extends Component {
  constructor() {
    super();
    this.species = [];
    list().then(species => {
      this.species = species;
      this.update();
    });
  }

  render() {
    return h(SpeciesList, { species: this.species });
  }
}

fritz.define('index-page', IndexPage);



/*
export default function(){
  const app = this;

  function allSpecies(req, res, next) {
    if(!app.state.species) {
      aliensList().then(species => {
        app.state.species = species;
        next();
      });
      return;
    }
    next();
  }

  app.get('/',
  allSpecies,
  function(req, res) {
    let species = app.state.species;
    res.push(indexTemplate(species));
  });

  app.get('/search',
  allSpecies,
  function(req, res){
    let query = req.url.searchParams.get('q');
    let species = app.state.species;

    res.push(searchTemplate(species, query));
  });

  app.post('/select', function(req, res){
    if(code === 40) {

    }
  });
}
*/

//import indexRoute from './index.js';
//import articleRoute from './article.js';

//import ArticlePage from './article.js';

class AliensClick extends Component {
  constructor() {
    super();
    this.page = 'index';
  }

  render() {
    if (this.page === 'index') {
      return h('index-page', null);
    } else {
      return h('article-page', null);
    }
  }
}

fritz.define('aliens-click', AliensClick);

/*
const app = fritz();

app
  .configure(indexRoute)
  .configure(articleRoute);
*/

/**
 * Color scheme
 * https://coolors.co/fefffe-e5fcf5-b3dec1-210124-750d37
 */

}());
