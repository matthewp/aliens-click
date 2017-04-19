import { h } from 'fritz';
import { thumbnail } from './utils.js';
import styles from './SpeciesList.css';

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

export default function({ filter, species, keyup }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return (
    <div data-url="/select" data-event="keyup" data-method="POST" data-include="keyCode" data-no-push>
      <style>{styles}</style>
      <h1>Aliens</h1>

      <form action="/search" data-event="keyup" data-no-push>
        <input onKeyup={keyup} type="text" value={ filter ? filter : '' } name="q" placeholder="Search species" class="alien-search" />
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
