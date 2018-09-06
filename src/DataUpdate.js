
export function onMatchingUpdate(exp, callback) {
  let handler = event => {
    if(event.data.type === 'data-update') {
      if(exp.test(event.data.path)) {
        callback(event.data.data);
      }
    }
  };
  
  self.addEventListener('message', handler);

  return () => {
    self.removeEventListener('message', handler);
  };
}