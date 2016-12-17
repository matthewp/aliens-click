function getWidth(element) {
  var style = element.currentStyle || window.getComputedStyle(element),
    width = element.offsetWidth, // or use style.width
    margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
    padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

  return width + margin - padding + border;
}

function getSpeciesPerRow(){
  return new Promise(function(resolve, reject){
    requestAnimationFrame(function(){
      let species = document.querySelector('.species');
      let windowWidth = species.offsetWidth;
      let itemWidth = getWidth(species.firstElementChild);
      let cnt = Math.floor(windowWidth / itemWidth);
      resolve(cnt);
    });
  });
}

document.documentElement.addEventListener('keyup', function(ev){
  if(ev.target.id !== 'alien-search') {
    return;
  }

  let cmd;
  switch(ev.keyCode) {
    case 38:
      cmd = 'UP';
      break;
    case 40:
      cmd = 'DOWN';
      break;
    case 37:
      cmd = 'LEFT';
      break;
    case 39:
      cmd = 'RIGHT';
      break;
  }

  if(cmd) {
    ev.stopPropagation();
    getSpeciesPerRow().then(function(count){
      fritz.request({
        method: 'POST',
        url: '/select',
        body: { cmd, count }
      });
    });
  }
}, true);
