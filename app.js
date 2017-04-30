(function () {
'use strict';

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';

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

  destroy() {}
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
    if (id == null) {
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
    if (!this._store) {
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
  if (eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let id = Handle$1.from(attrValue).id;
    return [1, eventName, id];
  }
}

class Tree extends Array {}

function h(tag, attrs, children) {
  const argsLen = arguments.length;
  if (argsLen === 2) {
    if (typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if (argsLen > 3 || children instanceof Tree || typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if (isFn) {
    var localName = tag.prototype.localName;
    if (localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if (attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function (acc, key) {
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if (eventInfo) {
        if (!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if (attrs) {
    open.push(attrs);
  }
  if (evs) {
    open.push(evs);
  }
  tree.push(open);

  if (children) {
    children.forEach(function (child) {
      if (typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while (child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);

  return tree;
}

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

function getInstance(fritz, id) {
  return fritz._instances[id];
}

function setInstance(fritz, id, instance) {
  fritz._instances[id] = instance;
}

function delInstance(fritz, id) {
  delete fritz._instances[id];
}

function render(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
  if (!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperty(instance, '_fritzId', {
      enumerable: false,
      value: id
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }

  Object.assign(instance, props);

  let tree = instance.render();
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
}

function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if (msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if (method) {
    let event = new Event(msg.name);
    event.value = msg.value;

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

function destroy(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.destroy();
  delInstance(fritz, msg.id);
}

let hasListened = false;

function relay(fritz) {
  if (!hasListened) {
    hasListened = true;

    self.addEventListener('message', function (ev) {
      let msg = ev.data;
      switch (msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
        case STATE:
          fritz.state = msg.state;
          break;
        case DESTROY:
          destroy(fritz, msg);
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
  if (constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props
  });
}

let state;
Object.defineProperty(fritz, 'state', {
  set: function (val) {
    state = val;
  },
  get: function () {
    return state;
  }
});

function first(a){let b=Object.keys(a)[0];return a[b]}function thumbnail(a){let b=a.thumbnail||'';return b=b.replace('http:',''),b}

var styles = ".alien-search {\n  background: var(--alt-bg-color, #0B0014);\n  color: var(--fg-color, #F5E9E2);\n  border: none;\n  line-height: 1.5em;\n  padding: .5em;\n  outline: none;\n  font-size: 1.2em;\n  width: 100%;\n}\n\n.species {\n  list-style-type: none;\n  padding: 0;\n}\n\n.species figure {\n  display: flex;\n  justify-content: center;\n  margin: 0;\n  max-height: 200px;\n}\n\n.specie figure img {\n  border-radius: 5px;\n}\n\n@media only screen and (max-device-width: 767px) {\n  .specie figure img {\n    width: 150px;\n    height: 150px;\n  }\n}\n\nh1, h2, h3 {\n  color: var(--header-color);\n}\n\n.specie {\n  position: relative;\n  display: inline-flex;\n  margin: 10px;\n}\n\n.specie-title {\n  position: absolute;\n  background: rgba(0,0,0,.5);\n  color: var(--alt-link-color, white);\n  padding: 3px;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: center;\n}";

function Specie({specie:a}){let b=`/article/${a.id}`,c=thumbnail(a);return h('li',{'class':'specie'},h('a',{href:b},h('figure',null,c?h('img',{src:c}):''),h('span',{'class':'specie-title'},a.title)))}var SpeciesList = function({filter:a,species:b,keyup:c}){let d=a?filterSpecies(b,a):b;return h('div',null,h('style',null,styles),h('h1',null,'Aliens'),h('form',{action:'/search'},h('input',{onKeyup:c,type:'text',value:a?a:'',name:'q',placeholder:'Search species','class':'alien-search'})),h('ul',{'class':'species'},d.map(e=>{return h(Specie,{specie:e})})))};function filterSpecies(a,b){return b=b.toLowerCase(),a.filter(c=>-1!==c.title.toLowerCase().indexOf(b))}

function list(){return fetch('/api/aliens').then(a=>a.json())}function article(a){return fetch(`/api/article/${a}?width=300`).then(b=>b.json())}

class PageSelect extends Component{static get props(){return{page:{attribute:!0},articleId:{attribute:!0}}}render(){let a=this.page||'index';return'index'===a?h('index-page',null):h('article-page',{article:this.articleId})}}fritz.define('page-select',PageSelect);

var Loading = function(){return h("div",{"class":"loading"},h("svg",{version:"1.1",id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",x:"0px",y:"0px",width:"24px",height:"30px",viewBox:"0 0 24 30",style:"enable-background:new 0 0 50 50;"},h("rect",{x:"0",y:"0",width:"4",height:"10",fill:"#E5FCF5",transform:"translate(0 17.7778)"},h("animateTransform",{attributeType:"xml",attributeName:"transform",type:"translate",values:"0 0; 0 20; 0 0",begin:"0",dur:"0.6s",repeatCount:"indefinite"})),h("rect",{x:"10",y:"0",width:"4",height:"10",fill:"#E5FCF5",transform:"translate(0 4.44444)"},h("animateTransform",{attributeType:"xml",attributeName:"transform",type:"translate",values:"0 0; 0 20; 0 0",begin:"0.2s",dur:"0.6s",repeatCount:"indefinite"})),h("rect",{x:"20",y:"0",width:"4",height:"10",fill:"#E5FCF5",transform:"translate(0 8.88889)"},h("animateTransform",{attributeType:"xml",attributeName:"transform",type:"translate",values:"0 0; 0 20; 0 0",begin:"0.4s",dur:"0.6s",repeatCount:"indefinite"}))))};

function article$1({data:a}){let b=a.article.sections[0],c=first(a.detail.items);return h('div',{'class':'species-article'},h('header',null,h('h1',null,b.title)),h('article',null,h('figure',null,h('img',{src:thumbnail(c)})),h('div',null,a.article.sections.map(articleSection))))}function articleSection(a,b){return h('section',null,0===b?'':h('h2',null,a.title),h('div',null,a.content.map(c=>{switch(c.type){case'list':return list$1(c);default:return h('p',null,c.text);}})))}function list$1(a){return h('ul',null,a.elements.map(b=>{return h('li',null,b.text)}))}

var styles$1 = ".loading {\n  display: flex;\n  justify-content: center;\n}\n\n.loading svg {\n  height: 150px;\n  width: 150px;\n}\n\n.species-article header h1 {\n  font-size: 2.5em;\n}\n\n.species-article figure {\n  float: right;\n}\n\n.species-article p {\n  line-height: 23px;\n}";

class ArticlePage extends Component{static get props(){return{article:{attribute:!0}}}constructor(){super(),this.data=fritz.state,fritz.state=null;}get article(){return this._article}set article(a){this._article=+a;}loadArticle(){const a=this.article;isNaN(a)||article(a).then(b=>{this.data=b,this.update();});}render(){return this.data||this.loadArticle(),h('section',null,h('style',null,styles$1),this.data?h(article$1,{data:this.data}):h(Loading,null))}}fritz.define('article-page',ArticlePage);

class IndexPage extends Component{constructor(){super(),this.filter='',this.species=[],fritz.state?this.species=fritz.state:list().then(a=>{this.species=a,this.update();});}keyup(a){this.filter=a.value;}render(){return h(SpeciesList,{species:this.species,keyup:this.keyup,filter:this.filter})}}fritz.define('index-page',IndexPage);

}());
