// @flow

const {equals} = require('bens_utils').vectors;
const {hotKeysReducer} = require('./hotKeysReducer');
const {mouseReducer} = require('./mouseReducer');
const {render} = require('../render');

const rootReducer = (state, action) => {
  if (state === undefined) return initState();
  switch (action.type) {
    case 'SET': {
      const {property, value} = action;
      state[property] = value;
      return state;
    }
    case 'SET_SCREEN':
      return {
        ...state,
        screen: action.screen,
      };
    case 'SET_VIDEO_INDEX':
      return {
        ...state,
        videoIndex: action.videoIndex,
      };
    case 'SET_HOTKEY':
    case 'SET_KEY_PRESS': {
      return {
        ...state,
        hotKeys: hotKeysReducer(state.hotKeys, action),
      }
    }
    case 'SET_MOUSE_POS':
    case 'SET_MOUSE_DOWN': {
      return {
        ...state,
        mouse: mouseReducer(state.mouse, action),
      }
    }
    case 'SET_LINES': {
      const {lines, videoIndex} = action;
      state.drawings[action.videoIndex] = [...state.curLines || []];
      for (const line of lines) {
        state.drawings[videoIndex].push(line);
      }
      render(state);
      return state;
    }
    case 'ADD_LINES': {
      const {lines, videoIndex} = action;
      if (!state.drawings[videoIndex]) {
        state.drawings[videoIndex] = [];
      }
      for (const line of lines) {
        state.drawings[videoIndex].push(line);
      }
      render(state);
      return state;
    }
    case 'ADD_LINE': {
      const {start, end, videoIndex} = action;
      if (equals(start, end)) return state;
      if (!state.drawings[videoIndex]) {
        state.drawings[videoIndex] = [];
      }
      state.drawings[videoIndex].push({start, end});
      state.curLines.push({start, end});
      render(state);
      return state;
    }
  }

  return state;
};

const initState = () => {
  return {
    clientID: -1,
    screen: 'GRID',
    videoIndex: 0,
    drawings: {},
    curLines: [],
  };
}

module.exports = {rootReducer}
