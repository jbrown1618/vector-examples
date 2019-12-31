import { vec, mat } from '@josh-brown/vector';

/*
 * All calculations are being done in px and ms, but for initialization we
 * would like to use meters and seconds.  Here are some useful numbers for
 * conversions.
 */
const PX_PER_M = 8221;
const MS_PER_S = 1000;

const reflectVertically = mat([[1, 0], [0, -0.8]]);
const reflectHorizontally = mat([[-0.8, 0], [0, 1]]);

const iterationInterval = 10;

start(init());

function init() {
  const state = {
    position: vec([50, 50]),
    velocity: vec([0.1, 0.3])
      .scalarMultiply(PX_PER_M / MS_PER_S), // convert to px/ms
    acceleration: vec([0, -0.98]) // let's do this in 1/10g
      .scalarMultiply(PX_PER_M / (MS_PER_S * MS_PER_S)), // convert to px/ms^s
    width: 800,
    height: 500
  };

  const canvas = document.createElement('canvas');
  canvas.height = state.height;
  canvas.width = state.width;
  canvas.style = 'display: block; border: 1px solid gray;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  return { state, ctx };
}

function start({ state, ctx }) {
  mainLoop();
  renderLoop();

  function mainLoop() {
    state = iterate(state, iterationInterval);
    setTimeout(mainLoop, iterationInterval);
  }

  function renderLoop() {
    render(ctx, state);
    requestAnimationFrame(renderLoop);
  }
}

function iterate(state, deltaT) {
  if (!state) throw Error();

  const { position, velocity, acceleration, width, height } = state;

  let newV = velocity.add(acceleration.scalarMultiply(deltaT));
  let newX = position.add(velocity.scalarMultiply(deltaT));

  if (newX.getEntry(0) < 0) {
    newX = vec([0, newX.getEntry(1)]);
    newV = reflectHorizontally.apply(newV);
  } else if (newX.getEntry(0) > width) {
    newX = vec([width, newX.getEntry(1)]);
    newV = reflectHorizontally.apply(newV);
  }

  if (newX.getEntry(1) < 0) {
    newX = vec([newX.getEntry(0), 0]);
    newV = reflectVertically.apply(newV);
  } else if (newX.getEntry(1) > height) {
    newX = vec([newX.getEntry(0), height]);
    newV = reflectVertically.apply(newV);
  }

  return {
    ...state,
    position: newX,
    velocity: newV
  };
}

function translateState(state) {
  return {
    x: state.position.getEntry(0),
    y: state.height - state.position.getEntry(1)
  };
}

function render(ctx, state) {
  const { x, y } = translateState(state);

  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = '#32a852';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill();
}
