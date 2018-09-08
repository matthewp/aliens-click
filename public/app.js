(function () {
'use strict';

function getInstance(fritz, id){
  return fritz._instances[id];
}

function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
}

function delInstance(fritz, id){
  delete fritz._instances[id];
}

function isFunction(val) {
  return typeof val === 'function';
}

const defer = Promise.resolve().then.bind(Promise.resolve());

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';
const RENDERED = 'rendered';
const CLEANUP = 'cleanup';
const REGISTER = 'register';

let currentInstance = null;

function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
}

let queue = [];

function enqueueRender(instance, sentProps) {
  if(!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps])==1) {
    defer(rerender);
  }
}

function rerender() {
	let p, list = queue;
	queue = [];
	while ( (p = list.pop()) ) {
		if (p[0]._dirty) render(p[0], p[1]);
	}
}

function render(instance, sentProps) {
  if(sentProps) {
    var nextProps = Object.assign({}, instance.props, sentProps);
    instance.componentWillReceiveProps(nextProps);
    instance.props = nextProps;
  }

  if(instance.shouldComponentUpdate(nextProps) !== false) {
    instance.componentWillUpdate();
    instance._dirty = false;

    postMessage({
      type: RENDER,
      id: instance._fritzId,
      tree: renderInstance(instance)
    });
  }
}

class Component {
  constructor() {
    this.state = {};
    this.props = {};
  }

  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  setState(state) {
    let s = this.state;
    Object.assign(s, isFunction(state) ? state(s, this.props) : state);
    enqueueRender(this);
  }

  // Force an update, will change to setState()
  update() {
    console.warn('update() is deprecated. Use setState() instead.');
    this.setState({});
  }

  componentWillReceiveProps(){}
  shouldComponentUpdate() {
    return true;
  }
  componentWillUpdate(){}
  componentWillUnmount(){}
}

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
    this.inUse = true;
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

  del() {
    let store = Handle.store;
    store.handleMap.delete(this.fn);
    store.idMap.delete(this.id);
  }
};

var Handle$1 = Handle;

const templateTag = 0;
const valueTag = 1;

const templates = new WeakMap();
const _template = Symbol();
let globalId = 0;


var html = function(strings, ...args) {
  let id;
  if(templates.has(strings)) {
    id = templates.get(strings);
  } else {
    globalId = globalId + 1;
    id = globalId;
    templates.set(strings, id);
    register(id, strings);
  }

  // Set values
  let vals = args.map(arg => {
    let type = typeof arg;
    if(type === 'function') {
      let handle = Handle$1.from(arg);
      handle.inUse = true;
      currentInstance._fritzHandles.set(handle.id, handle);
      return Uint8Array.from([0, handle.id]);
    } else if (Array.isArray(arg)) {
      let tag, values = arg;
      if(isTemplate(arg)) {
        tag = templateTag;
      } else {
        tag = valueTag;

        values = arg.map(item => {
          if(isTemplate(item)) {
            return [templateTag, item];
          }
          return item;
        });
      }
      return [tag, values];
    }
    return arg;
  });

  return mark([1, id, 2, vals]);
};

function register(id, template) {
  postMessage({
    type: REGISTER,
    id,
    template
  });
}

function mark(template) {
  template[_template] = true;
  return template;
}

function isTemplate(template) {
  return !!template[_template];
}

function render$1(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperties(instance, {
      _fritzId: {
        enumerable: false,
        value: id
      },
      _fritzHandles: {
        enumerable: false,
        writable: true,
        value: new Map()
      }
    });
    setInstance(fritz, id, instance);
  }

  enqueueRender(instance, props);
}

function trigger(fritz, msg){
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if(msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let name = msg.event.type;
    let methodName = 'on' + name[0].toUpperCase() + name.substr(1);
    method = inst[methodName];
  }

  if(method) {
    let event = msg.event;
    method.call(inst, event);

    enqueueRender(inst);
  } else {
    // TODO warn?
  }
}

function destroy(fritz, msg){
  let instance = getInstance(fritz, msg.id);
  instance.componentWillUnmount();

  let handles = instance._fritzHandles;
  handles.forEach(function(handle){
    handle.del();
  });
  handles.clear();
  
  delInstance(fritz, msg.id);
}

function rendered(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.componentDidMount();
}

function cleanup(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  let handles = instance._fritzHandles;
  msg.handles.forEach(function(id){
    let handle = handles.get(id);
    handle.del();
    handles.delete(id);
  });
}

let hasListened = false;

function relay(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render$1(fritz, msg);
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
        case RENDERED:
          rendered(fritz, msg);
          break;
        case CLEANUP:
          cleanup(fritz, msg);
          break;
      }
    });
  }
}

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.html = html;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if(constructor.prototype === undefined ||
    constructor.prototype.render === undefined) {
    let render = constructor;
    constructor = class extends Component{};
    constructor.prototype.render = render;
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
    props: constructor.props,
    events: constructor.events,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
  });
}

let state;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

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

var SpeciesList = function ({ filter, species, keyup }) {
  let items = filter ? filterSpecies(species, filter) : species;

  return html`
    <div>
      <style>${ styles }</style>
      <h1>Aliens</h1>

      <form action="/search">
        <input onKeyup=${ keyup } type="text" value=${ filter ? filter : '' }
          name="q" placeholder="Search species" class="alien-search" />
      </form>
      <ul class="species">
        ${ items.map(specie => {
    return html`testing`;
    //return Specie({specie});
  }) }
      </ul>
    </div>
  `;
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

function onMatchingUpdate(exp, callback) {
  let handler = event => {
    if (event.data.type === 'data-update') {
      if (exp.test(event.data.path)) {
        callback(event.data.data);
      }
    }
  };

  self.addEventListener('message', handler);

  return () => {
    self.removeEventListener('message', handler);
  };
}

class PageSelect extends Component {
  constructor() {
    super();
  }

  static get props() {
    return {
      page: { attribute: true },
      articleId: { attribute: true }
    };
  }

  render({ page = 'index', articleId }) {
    if (page === 'index') {
      return html`<index-page></index-page>`;
    }

    return html`<article-page article=${ articleId }></article-page>`;
  }
}

fritz.define('page-select', PageSelect);

var Loading = function () {
  return html`
    <div class="loading">
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" >
        <rect x="0" y="0" width="4" height="10" fill="#E5FCF5" transform="translate(0 17.7778)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="10" y="0" width="4" height="10" fill="#E5FCF5" transform="translate(0 4.44444)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0.2s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="20" y="0" width="4" height="10" fill="#E5FCF5" transform="translate(0 8.88889)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0.4s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
      </svg>
    </div>
  `;
};

function article$1({ data }) {
  let intro = data.article.sections[0];
  let item = first(data.detail.items);

  return html`
    <div class="species-article">
      <header>
        <h1>${ intro.title }</h1>
      </header>
      <article>
        <figure>
          <img src=${ thumbnail(item) } />
        </figure>

        <div>
          ${ data.article.sections.map(articleSection) }
        </div>
      </article>
    </div>
  `;
}

function articleSection(section, idx) {
  return html`
    <section>
      ${ idx === 0 ? '' : html`<h2>${ section.title }</h2>` }

      <div>
        ${ section.content.map(content => {
    switch (content.type) {
      case 'list':
        return list$1(content);
      default:
        return html`<p>${ content.text }</p>`;
    }
  }) }
      </div>
    </section>
  `;
}

function list$1(content) {
  return html`
    <ul>
      ${ content.elements.map(elem => {
    return html`<li>${ elem.text }</li>`;
  }) }
    </ul>
  `;
}

var styles$1 = ".loading {\n  display: flex;\n  justify-content: center;\n}\n\n.loading svg {\n  height: 150px;\n  width: 150px;\n}\n\n.species-article header h1 {\n  font-size: 2.5em;\n}\n\n.species-article figure {\n  float: right;\n}\n\n.species-article p {\n  line-height: 23px;\n}";

class ArticlePage extends Component {
  constructor() {
    super();

    this.unregisterUpdate = onMatchingUpdate(/\/api\/article/, data => {
      this.setState({ data });
    });
  }

  static get props() {
    return {
      article: { attribute: true }
    };
  }

  componentWillUnmount() {
    this.unregisterUpdate();
  }

  loadArticle() {
    const id = Number(this.props.article);
    if (isNaN(id)) {
      return;
    }

    article(id).then(data => {
      this.setState({ data });
    });
  }

  render({}, { data }) {
    if (!data) {
      this.loadArticle();
    }

    return html`
      <section>
        <style>${ styles$1 }</style>
        ${ data ? article$1({ data }) : Loading() }
      </section>
    `;
  }
}

fritz.define('article-page', ArticlePage);

class IndexPage extends Component {
  constructor() {
    super();

    this.state = {
      filter: '',
      species: []
    };

    this.unregisterUpdate = onMatchingUpdate(/\/api\/aliens/, data => {
      this.setState({ species: data });
    });

    list().then(species => {
      this.setState({ species });
    });
  }

  componentWillUnmount() {
    this.unregisterUpdate();
  }

  keyup(ev) {
    this.setState({ filter: ev.value });
  }

  render({}, { species, filter }) {
    return SpeciesList({
      species, filter,
      keyup: this.keyup
    });
  }
}

fritz.define('index-page', IndexPage);

}());
