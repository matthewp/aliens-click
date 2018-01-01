let state = document.getElementById('state-from-server').dataset.state;
if(state) {
  state = JSON.parse(state);
} else {
  state = Object.create(null);
}

function getInitialStateOnce() {
  let s = state;
  if(s != null) {
    state = null;
  }
  return s;
}

export {
  state,
  state as initialState,
  getInitialStateOnce
};
