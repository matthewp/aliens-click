import fritz, { h, Component } from 'fritz';
import SpeciesList from './SpeciesList.js';
import { details, list as aliensList } from './api.js';

class IndexPage extends Component {
  constructor() {
    super();
    this.filter = '';
    this.species = [];
    aliensList().then(species => {
      this.species = species;
      this.update();
    });
  }

  keyup(ev) {
    this.filter = ev.value;
  }

  render() {
    return <SpeciesList species={this.species} keyup={this.keyup}></SpeciesList>
  }
}

fritz.define('index-page', IndexPage);

export default IndexPage;

/*
export default function(){
  const app = this;

  function allSpecies(req, res, next) {
    if(!app.state.species) {
      aliensList().then(species => {
        app.state.species = species;
        next();
      });
      return;
    }
    next();
  }

  app.get('/',
  allSpecies,
  function(req, res) {
    let species = app.state.species;
    res.push(indexTemplate(species));
  });

  app.get('/search',
  allSpecies,
  function(req, res){
    let query = req.url.searchParams.get('q');
    let species = app.state.species;

    res.push(searchTemplate(species, query));
  });

  app.post('/select', function(req, res){
    if(code === 40) {

    }
  });
}
*/
