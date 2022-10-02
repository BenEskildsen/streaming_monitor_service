// @flow

const {config} = require('../config');
const {
  add, subtract, equals, makeVector, vectorTheta, multiply, floor,
} = require('bens_utils').vectors;
const {throttle} = require('bens_utils').helpers;

const initMouseControls = (store, handlers) => {
  const {dispatch, getState} = store;

  if (handlers.mouseMove) {
    document.onmousemove = throttle(moveHandler, [store, handlers], 12);
    document.ontouchmove = (ev) => {
      if (ev.target.id === 'canvas') {
        ev.preventDefault();
      }
      moveHandler(store, handlers, ev);
    }
  } else {
    document.onmousemove = null;
    document.ontouchmove = null;
  }


  document.ontouchstart = (ev) => {
    onMouseDown(store, ev, handlers);
  }

  document.ontouchend = (ev) => {
    onMouseUp(store, ev, handlers);
  }

  document.ontouchcancel = (ev) => {
    onMouseUp(store, ev, handlers);
  }

  // if (handlers.leftDown || handlers.rightDown) {
    document.onmousedown = (ev) => {
      onMouseDown(store, ev, handlers);
    }
  // }

  // if (handlers.leftUp || handlers.rightUp) {
    document.onmouseup = (ev) => {
      onMouseUp(store, ev, handlers);
    }
  // }

  if (handlers.scroll) {
    let scrollLocked = false;
    document.onwheel = (ev) => {
      if (!scrollLocked) {
        onScroll(store, ev, handlers);
        scrollLocked = true;
        setTimeout(() => {scrollLocked = false}, 150);
      }
    }
  }
};

/////////////////////////////////////////////////////////////////////
// Click
////////////////////////////////////////////////////////////////////

const onMouseDown = (store, ev, handlers): void => {
  let canvas = document.getElementById('canvas');
  // don't open the normal right-click menu
  if (canvas != null) {
    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  const mouseData = validateMouse(store, ev);
  if (mouseData == null) return;
  const {gridPos, state} = mouseData;
  const {dispatch} = store;

  if (ev.button == 0 || ev.type == 'touchstart') { // left click
    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: true, isDown: true, downPos: gridPos,
    });
    if (handlers.leftDown != null) {
      handlers.leftDown(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) { // right click
    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: false, isDown: true, downPos: gridPos,
    });
    if (handlers.rightDown != null) {
      handlers.rightDown(state, dispatch, gridPos);
    }
  }
};

const onMouseUp = (store, ev, handlers): void => {
  const mouseData = validateMouse(store, ev);
  if (mouseData == null) return;
  const {gridPos, state} = mouseData;
  const {dispatch} = store;

  if (ev.button == 0 || ev.type == 'touchend') { // left click
    dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false});
    if (handlers.leftUp != null) {
      handlers.leftUp(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) { // right click
    dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false});
    if (handlers.rightUp != null) {
      handlers.rightUp(state, dispatch, gridPos);
    }
  }
};

/////////////////////////////////////////////////////////////////////
// Scroll
////////////////////////////////////////////////////////////////////
const onScroll = (store, ev, handlers): void => {
  if (ev.target.id != 'canvas') return null;
  handlers.scroll(
    store.getState(),
    store.dispatch,
    ev.wheelDelta < 0 ? 1 : -1,
  );
};

////////////////////////////////////////////////////////////////////////////
// Mouse move
////////////////////////////////////////////////////////////////////////////
const moveHandler = (store, handlers, ev): void => {
  let canvas = document.getElementById('canvas');
  const {dispatch} = store;
  const mouseData = validateMouse(store, ev);
  if (mouseData == null) return;
  const {gridPos, state} = mouseData;

  const canvasPos = getMousePixel(ev, canvas);
  dispatch({type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos});
  if (handlers.mouseMove != null) {
    handlers.mouseMove(state, dispatch, gridPos, canvasPos);
  }
}

////////////////////////////////////////////////////////////////////////////
// click -> position helpers
////////////////////////////////////////////////////////////////////////////
const validateMouse = (store, ev) => {
  if (ev.target.id != 'canvas') return null;
  const state = store.getState();
  let canvas = document.getElementById('canvas');
  if (canvas == null) return null;
  const gridPos = getMouseCell(state, ev, canvas);
  if (gridPos == null) return null;

  return {state, gridPos};
};

const getMouseCell = (state, ev, canvas): ?Vector => {
  const pixel = getMousePixel(ev, canvas);
  return pixel;
};

const getMousePixel = (ev, canvas): ?Vector => {
  if (!canvas) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  let x = ev.clientX;
  let y = ev.clientY;
  if (
    ev.type === 'touchstart' || ev.type === 'touchmove'
  ) {
    const touch = ev.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  }
  if (ev.type == 'touchend') {
    const touch = ev.changedTouches[0];
    x = touch.clientX;
    y = touch.clientY;
  }
  const canvasPos = {
    x: x - rect.left,
    y: y - rect.top,
  };
  // return null if clicked outside the canvas:
  // if (
  //   canvasPos.x < 0 || canvasPos.y < 0 ||
  //   canvasPos.x > config.canvasWidth || canvasPos.y > config.canvasHeight
  // ) {
  //   return null;
  // }
  return canvasPos;
};

module.exports = {initMouseControls};
