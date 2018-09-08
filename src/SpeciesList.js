import { html } from 'fritz';
import { thumbnail } from './utils.js';
import styles from './SpeciesList.css';

function Specie({specie}) {
  let url = `/article/${specie.id}`;
  let tn = thumbnail(specie);

  return html`
    <li class="specie">
      <a href=${url}>
        <figure>
          ${ tn ? html`<img src=${tn} />` : '' }
        </figure>
        <span class="specie-title">${specie.title}</span>
      </a>
    </li>
  `;
}

export default function({ filter, species, keyup }) {
  let items = filter ? filterSpecies(species, filter) : species;

  return html`
    <div>
      <style>${styles}</style>
      <h1>Aliens</h1>

      <form action="/search">
        <input onKeyup=${keyup} type="text" value=${ filter ? filter : '' }
          name="q" placeholder="Search species" class="alien-search" />
      </form>
      <ul class="species">
        ${items.map(specie => {
          return html`testing`
          //return Specie({specie});
        })}
      </ul>
    </div>
  `;
}

function filterSpecies(species, query){
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) !== -1);
}
