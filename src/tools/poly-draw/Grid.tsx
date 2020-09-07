import React from "react";
import { Point, Tools, ActionTypes, Context, Shape } from "./Store";

type GridState = {
  size: number;
  width: number;
  height: number;
  x: number;
  y: number;
  origo: Point;
};

function createState(size: number, width: number, height: number): GridState {
  return {
    size,
    width,
    height,
    x: 0,
    y: 0,
    origo: {
      x: 0,
      y: 0,
    },
  };
}

function setZoom(
  state: GridState,
  size: number,
  width: number,
  height: number
): GridState {
  const wt = Math.ceil(width / size);
  const ht = Math.ceil(height / size);

  const newWidth = (wt + (wt % 2)) * size + 1;
  const newHeight = (ht + (ht % 2)) * size + 1;

  return {
    ...state,
    size,
    width: newWidth,
    height: newHeight,
    x: Math.round((width - newWidth) / 2),
    y: Math.round((height - newHeight) / 2),
    origo: {
      x: Math.round(newWidth / (size * 2)),
      y: Math.round(newHeight / (size * 2)),
    },
  };
}

function createGrid(state: GridState, ctx: CanvasRenderingContext2D): void {
  let x = 0.5;
  let y = 0.5;
  const w = state.width - 1;
  const h = state.height - 1;

  ctx.save();
  ctx.strokeStyle = "#e4e4e4";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  while (x < w) {
    x += state.size;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
  }
  x = 0.5;
  while (y < h) {
    y += state.size;
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "#00f";
  ctx.arc(
    state.origo.x * state.size + 0.5,
    state.origo.y * state.size + 0.5,
    3,
    0,
    2 * Math.PI
  );
  ctx.fill();

  ctx.restore();
}

function translate(grid: GridState, x: number, y: number): Point {
  x = Math.round((x - grid.x) / grid.size);
  y = Math.round((y - grid.y) / grid.size);

  return {
    x: x - grid.origo.x,
    y: y - grid.origo.y,
  };
}

function drawCoords(
  grid: GridState,
  { x, y }: Point,
  ctx: CanvasRenderingContext2D
): void {
  const point = translate(grid, x, y);
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillText("(" + point.x + ", " + point.y + ")", 10, 15);
  ctx.restore();
}

const toPoint = (state: GridState, p: Point): Point => {
  return {
    x: (p.x + state.origo.x) * state.size + state.x + 0.5,
    y: (p.y + state.origo.y) * state.size + state.y + 0.5,
  };
};

function updatePointer(
  grid: GridState,
  tool: Tools,
  shape: Shape,
  mousePoint: Point,
  ctx: CanvasRenderingContext2D
): void {
  if (tool === Tools.line && shape.length > 0) {
    const { x, y } = mousePoint;
    const c = toPoint(grid, shape[shape.length - 1]);

    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  drawCoords(grid, mousePoint, ctx);
}

function drawGrid(
  state: GridState,
  hiddenCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  hiddenCanvas.width = state.width;
  hiddenCanvas.height = state.height;

  const hiddenCTX = hiddenCanvas.getContext("2d");
  if (hiddenCTX) createGrid(state, hiddenCTX);
  ctx.drawImage(hiddenCanvas, state.x, state.y);
}

function drawShape(
  state: GridState,
  shape: Shape,
  ctx: CanvasRenderingContext2D
): void {
  ctx.save();
  ctx.beginPath();

  shape.forEach((point, idx) => {
    const p = toPoint(state, point);
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
  ctx.restore();
}

type GridProps = {
  width: number;
  height: number;
};

const Grid: React.FC<GridProps> = ({ width, height }) => {
  const [appState, dispatch] = React.useContext(Context);

  const initialState = createState(appState.zoom, width, height);
  const hiddenCanvas = document.createElement("canvas");

  const [state, setState] = React.useState(initialState);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawGrid(state, hiddenCanvas, ctx);
  }, [state, hiddenCanvas, canvasRef]);

  React.useEffect(() => {
    setState((state) => setZoom(state, appState.zoom, width, height));
  }, [canvasRef, appState.zoom, width, height]);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    const { tool, shape, mousePoint } = appState;
    if (ctx) {
      drawShape(state, appState.shape, ctx);
      updatePointer(state, tool, shape, mousePoint, ctx);
    }
  }, [canvasRef, appState, state]);

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "1px solid #ccc", width: "100%", height: "100%" }}
      onMouseDown={({ clientX, clientY }) => {
        const point = translate(state, clientX, clientY);
        dispatch({ type: ActionTypes.addPoint, point });
      }}
      onMouseMove={({ clientX, clientY }) => {
        const point = { x: clientX, y: clientY };
        dispatch({ type: ActionTypes.setMouse, point });
      }}
      width={width}
      height={height}
    ></canvas>
  );
};

export default Grid;
