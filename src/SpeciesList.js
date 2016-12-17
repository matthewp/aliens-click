import { h } from 'fritz';
import { thumbnail } from './utils.js';

function Specie({specie, selected}) {
  let url = `/article/${specie.id}`;
  let tn = thumbnail(specie);
  let className = 'specie' + (selected ? ' selected-specie' : '');

  return (
    <li class={className}>
      <a href={url}>
        <figure>
          { tn ? <img src={tn} /> : '' }
        </figure>
        <span class="specie-title">{specie.title}</span>
      </a>
    </li>
  );
}

export default function({ filter, species, selected }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return (
    <div data-url="/select" data-event="keyup" data-method="POST" data-include="keyCode" data-no-push>
      <h1>Aliens</h1>

      <form action="/search" data-event="keyup" data-no-push>
        <input type="text" value={ filter ? filter : '' } name="q" placeholder="Search species" class="alien-search" id="alien-search" />
      </form>
      <ul class="species">
        {items.map((specie, idx) => {
          let isSelected = idx === selected;

          return <Specie specie={specie} selected={isSelected} />
        })}
      </ul>
    </div>
  );
}

function filterSpecies(species, query){
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) !== -1);
}
