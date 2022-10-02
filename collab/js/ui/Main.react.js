// @flow
const React = require('react');
const {Button, Canvas} = require('bens_ui_components');
const VideoWidget = require('./VideoWidget.react');
const LiveVideoWidget = require('./LiveVideoWidget.react');
const {initKeyboardControlsSystem} = require('../systems/keyboardControlsSystem');
const {initMouseControls} = require('../systems/mouseControlsSystem');
const {initDrawingPollingSystem} = require('../systems/drawingPollingSystem');
const {render} = require('../render');
const {
  dispatchToServer, sendDrawingData,
  clearDrawingData,
} = require('../clientToServer');
const {isMobile} = require('bens_utils').platform;
const {useState, useEffect, useMemo, useReducer} = React;

const SRC = [
  'http://206.189.227.139/hls/test_0.m3u8',
  'http://206.189.227.139/hls/test_1.m3u8',
  'http://206.189.227.139/hls/test_2.m3u8',
  'http://206.189.227.139/hls/test_3.m3u8',
]

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
      width={350} height={200} videoSrc={SRC[i]}
      onClick={() => {
        dispatch({type: 'SET_VIDEO_INDEX', videoIndex: i});
        dispatch({type: 'SET_SCREEN', screen: 'FULL'});
      }}
    />);
  }

  return (
    <div
      style={{
        backgroundColor: 'black',
      }}
    >
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
    // const pollingInterval = initDrawingPollingSystem(store);
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'space',
      fn: (s) => {
        s.dispatch({type: 'SET_SCREEN', screen: 'GRID'});
      },
    });
    initMouseControls(store, getMouseControls(videoIndex));
    render(store.getState());
    return () => {
      // clearInterval(pollingInterval);
    }
  }, []);
  const screenWidth = window.innerWidth;
  const widgetWidth = screenWidth * 0.66;
  const sidebarWidth = screenWidth - widgetWidth - 20;
  const height = window.innerHeight;

  return (
    <span
      style={{
        backgroundColor: 'black',
      }}
    >
      <LiveVideoWidget
        width={widgetWidth} height={height} videoSrc={SRC[videoIndex]}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: widgetWidth, height,
        }}
      >
        <Canvas
          width={widgetWidth} height={height}
        />
      </div>
      <div style={{
        display: "inline-block",
        float: 'right',
        width: sidebarWidth,
        height,
        backgroundColor: 'black',
      }}>
        <Button
          label="Return to Grid"
          onClick={() => {
            dispatch({type: 'SET_SCREEN', screen: 'GRID'});
          }}
        />
        <Button
          label="Clear Drawings"
          onClick={() => {
            clearDrawingData(store, videoIndex);
          }}
        />
      </div>
    </span>
  );
}

const getMouseControls = (videoIndex) => {
  return {
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
      if (state.curLines.length > 0) {
        dispatchToServer(state.clientID, {
          type: 'ADD_LINES', videoIndex, lines: state.curLines, clientID: state.clientID,
        });
        // sendDrawingData(videoIndex, state.curLines);
      }
      dispatch({type: 'SET',
        property: 'curLines',
        value: [],
      });
    },
  };
};

module.exports = Main;
