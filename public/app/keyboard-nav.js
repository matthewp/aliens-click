function getItemsPerRow(list) {
  const grid = Array.from(list.children || list);
  if(grid.length === 0) return 0;
  const baseOffset = grid[0].offsetTop;
  const breakIndex = grid.findIndex(item => item.offsetTop > baseOffset);
  const numPerRow = (breakIndex === -1 ? grid.length : breakIndex);
  return numPerRow;
}

function init() {
  /* DOM variables */
  let root = this;
  let list;

  /* State variables */
  let rowMeasurementQueued;
  let itemsPerRow, activeIndex, numberOfItems;

  /* DOM update functions */
  function setActiveNode(activeIndex) {
    let node = (list.children || list)[activeIndex];
    node.firstElementChild.focus();
  }

  function navigate(key) {
    // If there is no activeIndex, start with 0
    if(activeIndex == null) {
      if(key === 40) {
        setActive(0);
      }
      return;
    }

    let isTopRow = activeIndex <= itemsPerRow - 1;
    let isBottomRow = activeIndex >= numberOfItems - itemsPerRow;
    let isLeftColumn = activeIndex % itemsPerRow === 0;
    let isRightColumn = activeIndex % itemsPerRow === itemsPerRow - 1 || activeIndex === numberOfItems - 1;

    switch(key) {
      // Up
      case 38: {
        if (!isTopRow) {
          setActive(activeIndex - itemsPerRow);
        } else {
          setActive(null);
          dispatchInputActive();
        }
        break;
      }
      // Down
      case 40: {
        if (!isBottomRow) {
          setActive(activeIndex + itemsPerRow);
        }
        break; 
      }
      // Left
      case 37: {
        if(!isLeftColumn) {
          setActive(activeIndex - 1);
        }
        break;
      }
      // Right
      case 39: {
        if(!isRightColumn) {
          setActive(activeIndex + 1);
        }
        break;
      }
    }
  }

  /* State update functions */
  function setItemsPerRow(value) {
    itemsPerRow = value;
  }

  function setNumberOfItems(value) {
    numberOfItems = value;
  }

  function setActive(value) {
    if(activeIndex !== value) {
      activeIndex = value;
      if(value != null)
        setActiveNode(value);
    }
  }

  /* Event dispatchers */
  function dispatchInputActive() {
    let ev = new CustomEvent('make-input-active', { bubbles: true });
    root.dispatchEvent(ev);
  }

  /* Event listeners */
  function onPageKeyDown(ev) {
    switch(ev.which) {
      case 38:
      case 40:
      case 37:
      case 39:
        ev.preventDefault();
        ev.stopPropagation();
        navigate(ev.which);
        break;
    }
  }

  /* Effects */
  function measureRowSize() {
    rowMeasurementQueued = false;
    let count = getItemsPerRow(list);
    setItemsPerRow(count);
  }

  function queueRowSizeMeasurement() {
    if(!rowMeasurementQueued) {
      rowMeasurementQueued = true;

      let promises = [];
      for(let elem of (list.children || list)) {
        promises.push(new Promise(resolve => {
          let img = elem.querySelector('img');
          if(img) {
            img.addEventListener('load', resolve, { once: true });
          } else {
            resolve();
          }
        }));
      }
      Promise.all(promises).then(measureRowSize);
    }
  }

  /* Initialization */
  document.addEventListener('keydown', onPageKeyDown);

  function disconnect() {
    document.removeEventListener('keydown', onPageKeyDown);
  }

  function update(data = {}) {
    if(data.list) {
      list = data.list;
      setActive(null);
    }
    if(data.count) setNumberOfItems(data.count);
    queueRowSizeMeasurement();
  }

  update.disconnect = disconnect;

  return update;
}

export default init;