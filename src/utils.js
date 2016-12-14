export function first(obj) {
  let key = Object.keys(obj)[0];
  return obj[key];
}

export function thumbnail(item, width, height) {
  let tn = item.thumbnail || '';
  tn = tn.replace('http:', '');

  // TODO maybe do something with the width and height
  return tn;
}
