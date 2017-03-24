import h from 'fritz/hyperscript.js';
import { thumbnail } from './utils.js';

function Specie({specie}) {
  let url = `/article/${specie.id}`;
  let tn = thumbnail(specie);

  return (
    <li class="specie">
      <a href={url}>
        <figure>
          { tn ? <img src={tn} /> : '' }
        </figure>
        <span class="specie-title">{specie.title}</span>
      </a>
    </li>
  );
}

export default function({ filter, species }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return (
    <div data-url="/select" data-event="keyup" data-method="POST" data-include="keyCode" data-no-push>
      <h1>Aliens</h1>

      <form action="/search" data-event="keyup" data-no-push>
        <input type="text" value={ filter ? filter : '' } name="q" placeholder="Search species" class="alien-search" />
      </form>
      <ul class="species">
        {items.map(specie => {
          return <Specie specie={specie}/>
        })}
      </ul>
    </div>
  );
}

function filterSpecies(species, query){
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) !== -1);
}
