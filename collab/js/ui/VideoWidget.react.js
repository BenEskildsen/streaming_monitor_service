// @flow

const React = require('react');
const {useState, useEffect, useMemo, useReducer} = React;

function VideoWidget(props) {
  const {width, height, video, id, onClick} = props;

  let widgetID = id ? id : "videoPlayer";

  useEffect(() => {
    const widget = document.getElementById(widgetID);
    if (!widget || !onClick) return;
    widget.addEventListener("click", onClick);
    widget.addEventListener("touchstart", onClick);

    return () => {
      widget.removeEventListener("click", onClick);
      widget.removeEventListener("touchstart", onClick);
    }

  }, []);
  return (
    <div
      style={{display: 'inline-block', height, width}}
    >
      <video
        id={widgetID} width={width} height={height} controls autoPlay muted
      >
        <source src={video.path} type={video.type} />
      </video>
    </div>
  );
}

module.exports = VideoWidget;
