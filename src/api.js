self.api = Object.create(null, {
  list: {
    value() {
      return fetch('/api/aliens').then(res => res.json());
    }
  },
  details: {
    value(ids) {
      return fetch(`/api/details/${ids.join(',')}`)
        .then(res => res.json())
        .then(data => {
          let species = Object.keys(data.items).map(id => data.items[id]);
          return species;
        });
    }
  },
  article: {
    value(id) {
      return fetch(`/api/article/${id}?width=300`).then(res => res.json());
    }
  }
});
