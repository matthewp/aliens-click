import fritz, { h, Component } from 'fritz';
import SpeciesList from './SpeciesList.js';
import { details, list as aliensList } from './api.js';
import './PageSelect.js';
import './ArticlePage.js';

class IndexPage extends Component {
  constructor() {
    super();
    this.filter = '';
    this.species = [];

    if(fritz.state) {
      this.species = fritz.state;
    } else {
      aliensList().then(species => {
        this.species = species;
        this.update();
      });
    }
  }

  keyup(ev) {
    this.filter = ev.value;
  }

  render() {
    return <SpeciesList species={this.species} keyup={this.keyup}
      filter={this.filter}></SpeciesList>
  }
}

fritz.define('index-page', IndexPage);