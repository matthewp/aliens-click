import fritz, { h, Component } from 'fritz';
import Layout from './Layout.js';
import SpeciesList from './SpeciesList.js';
import { details, list as aliensList } from './api.js';
import {
  index as indexTemplate,
  search as searchTemplate
} from './templates.js';

class IndexPage extends Component {
  constructor() {
    super();
    this.species = [];
    aliensList().then(species => {
      this.species = species;
      this.update();
    });
  }

  render() {
    return <SpeciesList species={this.species}></SpeciesList>
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
