export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  width: number;
  height: number;
}

export interface IEntity {
  id: number;
  family?: string;
}

export function hasEntity(particle: IParticle): particle is IEntity {
  return (particle as IEntity).id !== undefined;
}

export interface IPos {
  pos: IPoint;
}

export function hasPos(particle: IParticle): particle is IPos {
  return (particle as IPos).pos !== undefined;
}

export interface IRadius {
  radius: number;
}

export function hasRadius(particle: IParticle): particle is IRadius {
  return (particle as IRadius).radius !== undefined;
}

export interface IPoints {
  scale: number;
  points: [number, number][];
}

export function hasPoints(particle: IParticle): particle is IPoints {
  return (particle as IPoints).points !== undefined;
}

export interface ISize {
  size: IRect;
}

export function hasSize(particle: IParticle): particle is ISize {
  return (particle as ISize).size !== undefined;
}

export interface IMovement {
  velocity: IPoint;
}

export function hasMovement(particle: IParticle): particle is IMovement {
  return (particle as IMovement).velocity !== undefined;
}

export interface IThrust {
  friction: number;
  thrust: number;
}

export function hasThrust(particle: IParticle): particle is IThrust {
  return (particle as IThrust).thrust !== undefined;
}

export interface IColor {
  color: string;
}

export function hasColor(particle: IParticle): particle is IColor {
  return (particle as IColor).color !== undefined;
}

export interface IAngle {
  angle: number;
  rotation: number;
}

export function hasAngle(particle: IParticle): particle is IAngle {
  return (particle as IAngle).angle !== undefined;
}

export type IParticle =
  | IEntity
  | IPos
  | IAngle
  | IMovement
  | IThrust
  | IRadius
  | ISize
  | IPoints
  | IColor;

export interface ISystemQueue {
  enqueue: (event: ISystem) => void;
  dequeue: () => ISystem | undefined;
  peek: () => ISystem | undefined;
  isEmpty: () => boolean;
}

export interface IWorld {
  paused: boolean;
  particles: IParticle[];
  queue: ISystemQueue;
}

export interface ISystem {
  (world: IWorld): IWorld;
}
