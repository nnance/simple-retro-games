export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  width: number;
  height: number;
}

export interface IParticle {
  id: number;
  family?: string;
  components: IComponent[];
}

export interface IComponent {
  family?: string;
}

export interface IRadius extends IComponent {
  radius: number;
}

export function isRadius(component: IComponent): component is IRadius {
  return (component as IRadius).radius !== undefined;
}

export function getRadius(particle: IParticle) {
  return particle?.components.find((_) => isRadius(_)) as IRadius | undefined;
}

export interface IPoints extends IComponent {
  scale: number;
  points: [number, number][];
}

export function isPoints(component: IComponent): component is IPoints {
  return (component as IPoints).points !== undefined;
}

export function getPoints(particle: IParticle) {
  return particle?.components.find((_) => isPoints(_)) as IPoints | undefined;
}

export interface ISize extends IComponent {
  size: IRect;
}

export function isSize(component: IComponent): component is ISize {
  return (component as ISize).size !== undefined;
}

export function getSize(particle: IParticle) {
  return particle?.components.find((_) => isSize(_)) as ISize | undefined;
}

export interface IMovement extends IComponent {
  velocity: IPoint;
}

export function isMovement(component: IComponent): component is IMovement {
  return (component as IMovement).velocity !== undefined;
}

export function getMovement(particle: IParticle) {
  return particle?.components.find((_) => isMovement(_)) as
    | IMovement
    | undefined;
}

export interface IThrust extends IComponent {
  friction: number;
  thrust: number;
}

export function isThrust(component: IComponent): component is IThrust {
  return (component as IThrust).thrust !== undefined;
}

export function getThrust(particle: IParticle) {
  return particle?.components.find((_) => isThrust(_)) as IThrust | undefined;
}

export interface IColor extends IComponent {
  color: string;
}

export function isColor(component: IComponent): component is IColor {
  return (component as IColor).color !== undefined;
}

export function getColor(particle: IParticle) {
  return particle?.components.find((_) => isColor(_)) as IColor | undefined;
}

export interface IAngle extends IComponent {
  rotation: number;
  angle: number;
}

export function isAngle(component: IComponent): component is IAngle {
  return (component as IAngle).angle !== undefined;
}

export function getAngle(particle: IParticle) {
  return particle?.components.find((_) => isAngle(_)) as IAngle | undefined;
}

export interface IPosition extends IComponent {
  pos: IPoint;
}

export function isPosition(component: IComponent): component is IPosition {
  return (component as IPosition).pos !== undefined;
}

export function getPosition(particle: IParticle) {
  return particle?.components.find((_) => isPosition(_)) as
    | IPosition
    | undefined;
}

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
