// @flow

const React = require('react');
const {useState, useEffect, useMemo, useReducer} = React;

function LiveVideoWidget(props) {
  const {width, height, videoSrc, id, onClick} = props;

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

  useEffect(() => {
    const video = document.getElementById(widgetID);
    console.log("trying to get live stream", video, videoSrc);
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    }
    // hls.js is not supported on platforms that do not have Media Source
    // Extensions (MSE) enabled.
    //
    // When the browser has built-in HLS support (check using `canPlayType`),
    // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
    // element through the `src` property. This is using the built-in support
    // of the plain video element, without using hls.js.
    //
    // Note: it would be more normal to wait on the 'canplay' event below however
    // on Safari (where you are most likely to find built-in HLS support) the
    // video.src URL must be on the user-driven white-list before a 'canplay'
    // event will be emitted; the last video event that can be reliably
    // listened-for when the URL is not on the white-list is 'loadedmetadata'.
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
    }
  }, []);
  return (
    <div
      style={{display: 'inline-block', height, width}}
    >
      <video
        id={widgetID} width={width} height={height} controls autoPlay muted
      >
      </video>
    </div>
  );
}

module.exports = LiveVideoWidget;
