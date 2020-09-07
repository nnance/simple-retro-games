import React from "react";

export type Point = {
  x: number;
  y: number;
};

export enum Tools {
  move,
  line,
}

export type Shape = Point[];

export type AppState = {
  zoom: number;
  shape: Shape;
  mousePoint: Point;
  tool: Tools;
};

export enum ActionTypes {
  setZoom,
  setCode,
  addPoint,
  setMouse,
}

type ZoomAction = { type: ActionTypes.setZoom; zoom: number };
type CodeAction = { type: ActionTypes.setCode; code: string };
type AddPointAction = { type: ActionTypes.addPoint; point: Point };
type SetMouseAction = { type: ActionTypes.setMouse; point: Point };

export type AppActions =
  | ZoomAction
  | CodeAction
  | AddPointAction
  | SetMouseAction;

type Store = [AppState, React.Dispatch<AppActions>];

const createAppState = (): AppState => ({
  zoom: 28,
  shape: [],
  mousePoint: { x: 0, y: 0 },
  tool: Tools.line,
});

const setCode = (state: AppState, code: string): AppState => {
  const nums = JSON.parse(code) as number[];
  const shape = nums.reduce((prev, num, idx) => {
    const point: Point = { x: num, y: nums[idx + 1] };
    return idx % 2 === 0 ? prev.concat(point) : prev;
  }, [] as Point[]);

  const point = shape.length > 1 && shape[shape.length - 1];

  const tool =
    point && point.x === shape[0].x && point.y === shape[0].y
      ? Tools.move
      : state.tool;
  return { ...state, shape, tool };
};

const addPoint = (state: AppState, point: Point): AppState => {
  const shape = state.shape.concat(point);
  const tool =
    shape.length > 1 && point.x === shape[0].x && point.y === shape[0].y
      ? Tools.move
      : state.tool;
  return { ...state, shape, tool };
};

const reducer = (state: AppState, action: AppActions): AppState => {
  return action.type === ActionTypes.setZoom
    ? { ...state, zoom: action.zoom }
    : action.type === ActionTypes.setCode
    ? setCode(state, action.code)
    : action.type === ActionTypes.addPoint
    ? addPoint(state, action.point)
    : action.type === ActionTypes.setMouse
    ? { ...state, mousePoint: action.point }
    : state;
};

export const Context = React.createContext<Store>([
  createAppState(),
  (): void => undefined,
]);

export const StoreProvider: React.FC = ({ children }) => {
  const store = React.useReducer(reducer, createAppState());
  return <Context.Provider value={store}>{children}</Context.Provider>;
};
