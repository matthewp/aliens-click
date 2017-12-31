let state = document.getElementById('state-from-server').dataset.state;
if(state) {
  state = JSON.parse(state);
} else {
  state = Object.create(null);
}

export {
  state,
  state as initialState
};
