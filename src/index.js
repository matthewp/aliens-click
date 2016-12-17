import { h } from 'fritz';
import Layout from './Layout.js';
import SpeciesList from './SpeciesList.js';
import { details, list as aliensList } from './api.js';
import {
  index as indexTemplate,
  search as searchTemplate,
  selection as selectionTemplate
} from './templates.js';

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

  function applySelection(req, res, next) {
    let { cmd, count } = req.body;

    let selectedIndex = app.state.selectedIndex;
    let currentIndex = typeof selectedIndex !== 'undefined' ? selectedIndex : -5;
    switch(cmd) {
      case 'DOWN':
        currentIndex = currentIndex + count;
        break;
      case 'UP':
        currentIndex = currentIndex === -1 ? -1 : currentIndex - count;
      case 'LEFT':
        currentIndex--;
        break;
      case 'RIGHT':
        currentIndex++;
        break;
    }

    app.state.selectedIndex = req.selectedIndex = currentIndex;
    next();
  }

  app.post('/select', allSpecies, applySelection, function(req, res){
    let species = app.state.species;
    res.push(selectionTemplate(species, req.selectedIndex));
  });
}

