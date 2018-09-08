import { html } from 'fritz';
import { first, thumbnail } from './utils.js';

export default article;

function article({ data }) {
  let intro = data.article.sections[0];
  let item = first(data.detail.items);

  return html`
    <div class="species-article">
      <header>
        <h1>${intro.title}</h1>
      </header>
      <article>
        <figure>
          <img src=${thumbnail(item)} />
        </figure>

        <div>
          ${data.article.sections.map(articleSection)}
        </div>
      </article>
    </div>
  `;
}

function articleSection(section, idx) {
  return html`
    <section>
      ${idx === 0 ? '' : html`<h2>${section.title}</h2>`}

      <div>
        ${section.content.map(content => {
          switch(content.type) {
            case 'list':
              return list(content);
            default:
              return html`<p>${content.text}</p>`;
          }
        })}
      </div>
    </section>
  `;
}

function list(content) {
  return html`
    <ul>
      ${content.elements.map(elem => {
        return html`<li>${elem.text}</li>`;
      })}
    </ul>
  `;
}
