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

export interface IWorld {
  particles: IParticle[];
  events: IParticleEvent[];
}

export interface ISystem {
  (world: IWorld): IWorld;
}
