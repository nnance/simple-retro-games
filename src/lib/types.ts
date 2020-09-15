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
  pos: IPoint;
  radius?: number;
  scale?: number;
  size?: IRect;
  velocity?: IPoint;
  points?: [number, number][];
  friction?: number;
  thrust?: number;
  components: IComponent[];
}

export interface IComponent {
  family?: string;
}

export interface IColor extends IComponent {
  color: string;
}

export function isColor(component: IComponent): component is IColor {
  return (component as IColor).color !== undefined;
}

export function getColor(particle: IParticle) {
  return particle.components.find((_) => isColor(_)) as IColor | undefined;
}

export interface IAngle extends IComponent {
  rotation: number;
  angle: number;
}

export function isAngle(component: IComponent): component is IAngle {
  return (component as IAngle).angle !== undefined;
}

export function getAngle(particle: IParticle) {
  return particle.components.find((_) => isAngle(_)) as IAngle | undefined;
}

export interface IPosition extends IComponent {
  pos: IPoint;
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
