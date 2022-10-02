// @flow

import type {Mouse, Action} from '../types';

const mouseReducer = (mouse: Mouse, action: Action): Mouse => {
  if (mouse === undefined) {
    mouse = {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      prevPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
      curPixel: {x: 0, y: 0},
      prevPixel: {x: 0, y: 0},
    };
  }
  switch (action.type) {
    case 'SET_MOUSE_DOWN': {
      const {isLeft, isDown, downPos} = action;
      return {
        ...mouse,
        isLeftDown: isLeft ? isDown : mouse.isLeftDown,
        isRightDown: isLeft ? mouse.isRightDown : isDown,
        downPos: isDown && downPos != null ? downPos : mouse.downPos,
      };
    }
    case 'SET_MOUSE_POS': {
      const {curPos, curPixel} = action;
      return {
        ...mouse,
        prevPos: {...mouse.curPos},
        curPos,
        prevPixel: {...mouse.curPixel},
        curPixel,
      };
    }
  }
};

module.exports = {mouseReducer};
