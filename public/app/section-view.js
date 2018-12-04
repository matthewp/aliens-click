function paragraph() {
  const template = document.createElement('template');
  template.innerHTML = /* html */ `<p></p>`;

  function clone() {
    return document.importNode(template.content, true);
  }

  function init() {
    /* DOM variables */
    let frag = clone();
    let pNode = frag.firstElementChild;

    /* DOM update functions */
    function setPNode(value) {
      pNode.textContent = value;
    }

    /* Initialization */
    function update(data) {
      setPNode(data.text);
      return frag;
    }

    return update;
  }

  return init;
}

function list() {
  const template = document.createElement('template');
  /*
      <ul>
      ${content.elements.map(elem => {
        return html`<li>${elem.text}</li>`;
      })}
    </ul>
  */
  template.innerHTML = /* html */ `<ul></ul>`;

  function clone() {
    return document.importNode(template.content, true);
  }

  function init() {
    /* DOM variables */
    let frag = clone();
    let elementsNode = frag.firstElementChild;

    /* DOM functions */
    function setElementsNode(value) {
      for(let elem of value) {
        let li = document.createElement('li');
        li.textContent = elem.text;
        elementsNode.appendChild(li);
      }
    }

    /* Initialization */
    function update(data) {
      setElementsNode(data.elements);
      return frag;
    }

    return update;
  }

  return init;
}

function section() {
  const template = document.createElement('template');
  template.innerHTML = /* html */ `
    <section>
      <div class="content"></div>
    </section> 
  `;
  
  function clone() {
    return document.importNode(template.content, true);
  }

  function init() {
    /* DOM variables */
    let frag = clone();
    let sectionNode = frag.firstElementChild;
    let contentNode = frag.querySelector('.content');
    let titleNode;

    /* State variables */
    let index, section;

    /* DOM update functions */
    function setTitleNode(value) {
      if(!titleNode) {
        titleNode = document.createElement('h2');
        titleNode.textContent = value;
        sectionNode.insertBefore(titleNode, sectionNode.firstChild);
      }
    }

    function setContentNode(value) {
      for(let cont of value) {
        let frag;
        switch(cont.type) {
          case 'list': {
            let updateList = listView();
            frag = updateList(cont);
          }
          default: {
            let updateParagraph = paragraphView();
            frag = updateParagraph(cont);
          }
        }
        contentNode.appendChild(frag);
      }
    }

    /* State update functions */
    function setIndex(value) {
      if(index !== value) {
        index = value;
      }
    }

    function setSection(value) {
      if(section !== value) {
        section = value;
        
        if(index !== 0) {
          setTitleNode(section.title);
        }
        setContentNode(section.content);
      }
    }

    function update(data = {}) {
      if(data.index != null) setIndex(data.index);
      if(data.section) setSection(data.section);
      return frag;
    }

    return update;
  }

  return init;
}

export const paragraphView = paragraph();
export const listView = list();
export default section();