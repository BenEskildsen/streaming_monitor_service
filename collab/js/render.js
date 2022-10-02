// @flow

let cur = null;
let prevTime = 0;
let msAvg = 0;
const weightRatio = 0.1;
const render = (game: Game): void => {
  window.requestAnimationFrame((timestamp) => {
    const curTime = new Date().getTime();

    // don't call renderFrame multiple times on the same timestamp
    if (timestamp == cur) {
      return;
    }
    cur = timestamp;

    if (prevTime > 0) {
      msAvg = msAvg * (1 - weightRatio) + (curTime - prevTime) * weightRatio;
    }
    // console.log(1 / (msAvg / 1000));

    renderFrame(game);

    prevTime = curTime;
  });
}

let canvas = null;
let ctx = null;
const renderFrame = (state): void => {
  canvas = document.getElementById('canvas');
  if (!canvas) return; // don't break
  ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;

  if (!state.drawings[state.videoIndex]) return;

  ctx.beginPath();
  for (const line of state.drawings[state.videoIndex]) {
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
  }
  ctx.closePath();

};


module.exports = {render};
