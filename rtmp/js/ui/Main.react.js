// @flow
const React = require('react');
const {Canvas} = require('bens_ui_components');
const VideoWidget = require('./VideoWidget.react');
const LiveVideoWidget = require('./LiveVideoWidget.react');
const {initKeyboardControlsSystem} = require('../systems/keyboardControlsSystem');
const {initMouseControls} = require('../systems/mouseControlsSystem');
const {initDrawingPollingSystem} = require('../systems/drawingPollingSystem');
const {render} = require('../render');
const {dispatchToServer, sendDrawingData} = require('../clientToServer');
const {useState, useEffect, useMemo, useReducer} = React;

const SRC = 'http://206.189.227.139/hls/test.m3u8';

function Main(props) {
  const {state, dispatch, store} = props;
  const {screen, videoIndex} = state;


  let content = null;
  if (screen == 'FULL') {
    content = (<FullScreen
      videoIndex={videoIndex}
      store={store}
    />);
  } else if (screen == 'GRID') {
    content = (<VideoGrid
      numVideos={4}
      dispatch={dispatch}
    />);
  }

  return (
    <span>
      {content}
    </span>
  );
}

function VideoGrid(props) {
  const {numVideos, dispatch} = props;
  const widgets = [];
  for (let i = 0; i < numVideos; i++) {
    const video = {path: 'video_' + i, type: 'video/mp4'};
    widgets.push(<LiveVideoWidget
      id={"video_" + video.path}
      key={"video_" + video.path}
      width={350} height={200} videoSrc={SRC}
      onClick={() => {
        dispatch({type: 'SET_VIDEO_INDEX', videoIndex: i});
        dispatch({type: 'SET_SCREEN', screen: 'FULL'});
      }}
    />);
  }

  return (
    <div>
      {widgets}
    </div>
  );
}

function FullScreen(props) {
  const {videoIndex, store} = props;
  const {dispatch} = store;
  const video = {path: 'video_' + videoIndex, type: 'video/mp4'};

  useEffect(() => {
    initKeyboardControlsSystem(store);
    const pollingInterval = initDrawingPollingSystem(store);
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'space',
      fn: (s) => {
        s.dispatch({type: 'SET_SCREEN', screen: 'GRID'});
      },
    });
    initMouseControls(store, {
      mouseMove: (state, dispatch, gridPos) => {
        if (!state.mouse.isLeftDown) return;
        dispatch({type: 'SET', value: true, property: 'inMove'});

        if (state.prevInteractPos) {
          const prevPos = state.prevInteractPos;
          dispatch({type: 'ADD_LINE',
            start: {...prevPos},
            end: {...gridPos},
            videoIndex,
          });
          dispatch({type: 'SET',
            property: 'prevInteractPos',
            value: gridPos,
          });
        } else {
          dispatch({type: 'SET',
            property: 'prevInteractPos',
            value: gridPos,
          });
        }
      },
      leftUp: (state, dispatch, gridPos) => {
        dispatch({type: 'SET', value: false, property: 'inMove'});
        dispatch({type: 'SET',
          property: 'prevInteractPos',
          value: null,
        });
        // dispatchToServer(state.clientID, {type: 'ADD_LINES', videoIndex, lines: state.curLines});
        if (state.curLines.length > 0) {
          sendDrawingData(videoIndex, state.curLines);
        }
        dispatch({type: 'SET',
          property: 'curLines',
          value: [],
        });
      },
    });
    render(store.getState());
    return () => {
      clearInterval(pollingInterval);
    }
  }, []);

  return (
    <span>
      <LiveVideoWidget
        width={650} height={400} videoSrc={SRC}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: 650, height: 400,
        }}
      >
        <Canvas
          width={650} height={400}
        />
      </div>
    </span>
  );
}

module.exports = Main;
