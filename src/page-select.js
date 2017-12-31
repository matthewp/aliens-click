//import fritz, { h, Component } from 'fritz';
import { render, html } from './lit-html.js';

class PageSelect extends HTMLElement {
  static get observedAttributes() {
    return ['page', 'article-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._raf = null;
    this._canRender = false;
  }

  connectedCallback() {
    this._canRender = true;
  }

  attributeChangedCallback() {
    // Debounce re-rendering
    if(this._canRender && !this._raf) {
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this.update();
      });
    }
  }

  update() {
    let page = this.getAttribute('page');
    render(this.render(), this.shadowRoot);
  }

  render() {
    let page = this.getAttribute('page') || 'index';

    if(page === 'index') {
      return html`<index-page></index-page>`;
    } else {
      let articleId = this.getAttribute('article-id');
      return html`<article-page article=${articleId}></article-page>`;
    }
  }
}

customElements.define('page-select', PageSelect);
