
const initKeyboardControlsSystem = (store) => {
  const {dispatch} = store;

  //////////////////////////////////////////////////////////////////////////////
  // keypress event handling
  //////////////////////////////////////////////////////////////////////////////
  document.onkeydown = (ev) => {
    const state = store.getState();
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.hotKeys.onKeyDown[dir] != null) {
        state.hotKeys.onKeyDown[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: true});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.hotKeys.onKeyDown.enter != null) {
        state.hotKeys.onKeyDown.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: true});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.hotKeys.onKeyDown.space != null) {
        state.hotKeys.onKeyDown.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: true});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.hotKeys.onKeyDown[character] != null) {
        state.hotKeys.onKeyDown[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: true});
    }
  }

  document.onkeypress = (ev) => {
    const state = store.getState();
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.hotKeys.onKeyPress[dir] != null) {
        state.hotKeys.onKeyPress[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: true});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.hotKeys.onKeyPress.enter != null) {
        state.hotKeys.onKeyPress.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: true});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.hotKeys.onKeyPress.space != null) {
        state.hotKeys.onKeyPress.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: true});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.hotKeys.onKeyPress[character] != null) {
        state.hotKeys.onKeyPress[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: true});
    }
  }

  document.onkeyup = (ev) => {
    const state = store.getState();
    if (state == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.hotKeys.onKeyUp[dir] != null) {
        state.hotKeys.onKeyUp[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: false});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.hotKeys.onKeyUp.enter != null) {
        state.hotKeys.onKeyUp.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: false});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.hotKeys.onKeyUp.space != null) {
        state.hotKeys.onKeyUp.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: false});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.hotKeys.onKeyUp[character] != null) {
        state.hotKeys.onKeyUp[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: false});
    }
  }

}

const getUpDownLeftRight = (ev) => {
  const keyCode = ev.keyCode;

  if (keyCode === 87 || keyCode === 38 || keyCode === 119) {
    return 'down';
  }

  if (keyCode === 83 || keyCode === 40 || keyCode === 115) {
    return 'up';
  }

  if (keyCode === 65 || keyCode === 37 || keyCode === 97) {
    return 'left';
  }

  if (keyCode === 68 || keyCode === 39 || keyCode === 100) {
    return 'right';
  }
  return null;
}

module.exports = {initKeyboardControlsSystem};
