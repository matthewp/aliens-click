import loadStyles from './load-styles.js';

export function ensureShadow(BaseElement = HTMLElement) {
  return class extends BaseElement {
    constructor() {
      super();

      if(!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
    }
  }
};

export function upgradeStyles(BaseElement) {
  return class extends BaseElement {
    connectedCallback() {
      if(super.connectedCallback) {
        super.connectedCallback();
      }
      let root = this.shadowRoot;
      let name = this.localName;
      let selector = `#${name}-styles`;
      this._styles = root.querySelector(selector);

      // If there are no styles, load them
      if(!this._styles) {
        loadStyles(this.constructor.stylesUrl).then(styles => {
          this._styles = styles;
          this.update();
        });
      }
    }
  }
};
