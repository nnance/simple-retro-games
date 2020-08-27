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
  size?: IRect;
  velocity?: IPoint;
  points?: [number, number][];
  angle?: number;
}

export enum EventType {
  movePaddle,
  collision,
}

export interface IParticleEvent {
  particle: IParticle;
  type: EventType;
  collider?: IParticle;
  velocity?: IPoint;
}

export interface IEventsStore {
  get: () => IParticleEvent[];
  push: (event: IParticleEvent) => void;
  reset: () => void;
}

export interface IWorld {
  particles: IParticle[];
  events: IParticleEvent[];
}

export interface ISystem {
  (world: IWorld): IWorld;
}
