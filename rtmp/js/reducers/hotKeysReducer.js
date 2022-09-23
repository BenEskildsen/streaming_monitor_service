// @flow

import type {HotKeys, Action} from '../types';

const hotKeysReducer = (hotKeys: HotKeys, action: Action): HotKeys => {
  if (hotKeys === undefined) {
    hotKeys = {
      onKeyDown: {},
      onKeyPress: {},
      onKeyUp: {},
      keysDown: {},
    };
  }
	switch (action.type) {
		case 'SET_KEY_PRESS': {
			const {key, pressed, once} = action;
			hotKeys.keysDown[key] = pressed;
      if (once == true) {
        hotKeys.once = true;
      }
			return hotKeys;
		}
		case 'SET_HOTKEY': {
			const {key, press, fn} = action;
			hotKeys[press][key] = fn;
      return hotKeys;
		}
	}
}

module.exports = {hotKeysReducer};
