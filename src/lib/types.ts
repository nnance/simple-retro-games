export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  width: number;
  height: number;
}

export type TypeChecker<T> = (obj: unknown) => obj is T;

export interface IParticle {
  id: number;
  family?: string;
}

export interface IPos {
  pos: IPoint;
}

export const hasPos: TypeChecker<IPos> = (particle): particle is IPos => {
  return (particle as IPos).pos !== undefined;
};

export interface IRadius {
  radius: number;
}

export const hasRadius: TypeChecker<IRadius> = (
  particle
): particle is IRadius => {
  return (particle as IRadius).radius !== undefined;
};

export interface IPoints {
  scale: number;
  points: [number, number][];
}

export const hasPoints: TypeChecker<IPoints> = (
  particle
): particle is IPoints => {
  return (particle as IPoints).points !== undefined;
};

export interface ISize {
  size: IRect;
}

export const hasSize: TypeChecker<ISize> = (particle): particle is ISize => {
  return (particle as ISize).size !== undefined;
};

export interface IMovement {
  velocity: IPoint;
}

export const hasMovement: TypeChecker<IMovement> = (
  particle
): particle is IMovement => {
  return (particle as IMovement).velocity !== undefined;
};

export interface IThrust {
  friction: number;
  thrust: number;
}

export const hasThrust: TypeChecker<IThrust> = (
  particle
): particle is IThrust => {
  return (particle as IThrust).thrust !== undefined;
};

export interface IAngle {
  angle: number;
  rotation: number;
}

export const hasAngle: TypeChecker<IAngle> = (particle): particle is IAngle => {
  return (particle as IAngle).angle !== undefined;
};

export interface IColor {
  color: string;
}

export const hasColor: TypeChecker<IColor> = (particle): particle is IColor => {
  return (particle as IColor).color !== undefined;
};

export interface ISystemQueue<T> {
  enqueue: (event: ISystem<T>) => void;
  dequeue: () => ISystem<T> | undefined;
  peek: () => ISystem<T> | undefined;
  isEmpty: () => boolean;
}

export interface IWorld<T> {
  paused: boolean;
  particles: T[];
  queue: ISystemQueue<T>;
}

export interface ISystem<T> {
  (world: IWorld<T>): IWorld<T>;
}
