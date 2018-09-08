import fritz, { Component } from 'fritz';
import SpeciesList from './SpeciesList.js';
import { list as aliensList } from './api.js';
import { onMatchingUpdate } from './DataUpdate.js';
import './PageSelect.js';
import './ArticlePage.js';

class IndexPage extends Component {
  constructor() {
    super();

    this.state = {
      filter: '',
      species: []
    };

    this.unregisterUpdate = onMatchingUpdate(/\/api\/aliens/, data => {
      this.setState({ species: data });
    });

    aliensList().then(species => {
      this.setState({ species });
    });
  }

  componentWillUnmount() {
    this.unregisterUpdate();
  }

  keyup(ev) {
    this.setState({ filter: ev.value });
  }

  render({}, {species, filter}) {
    return SpeciesList({
      species, filter,
      keyup: this.keyup
    });
  }
}

fritz.define('index-page', IndexPage);