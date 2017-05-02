class SwapShadow extends self.HTMLElement {
  connectedCallback(){
    this.swap();
  }

  swap() {
    var root = this.parentNode;

    var childNodes = [].slice.call(this.childNodes);
    
    var frag = this.ownerDocument.createDocumentFragment();
    for(var i = 0, len = childNodes.length; i < len; i++) {
      frag.appendChild(childNodes[i]);
    }
    var shadow = root.shadowRoot || root.attachShadow({ mode: 'open' });
    shadow.appendChild(frag);
    root.removeChild(this);
  }
}

customElements.define('swap-shadow', SwapShadow);